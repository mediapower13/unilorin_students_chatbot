import os
from pinecone import Pinecone
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.agents import Tool, AgentExecutor, LLMSingleActionAgent, AgentOutputParser
from langchain.prompts import StringPromptTemplate
from langchain_openai import OpenAI
from langchain_community.embeddings import OpenAIEmbeddings
# For handling conversation history
from langchain.memory import ConversationBufferWindowMemory
# from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import LLMChain
from langchain_community.tools import DuckDuckGoSearchRun
from typing import List, Union
from langchain.schema import AgentAction, AgentFinish
import re
import openai
import asyncio

# Load api key
load_dotenv()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")

# Initialise pinecone and flask
pc = Pinecone(api_key=PINECONE_API_KEY)
app = Flask(__name__)
CORS(app)

# define embedding model
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002", openai_api_key=OPENAI_API_KEY)


# from langchain_community.vectorstores import Pinecone 
# define pinecone database index
index_name = "olabot"
index = pc.Index(index_name)

# Store memory for each session
user_memories = {}
user_memory = ''

# Define the tool
   

def pinecone_search(query):
    # generates embeddings for query
    embedding = embeddings.embed_query(query)
    
    # Perform similarity search
    result = index.query(vector=embedding, top_k=5, include_metadata=True)
    
    # Extract relevant information from the result
    matches = [match['metadata']['text'] for match in result['matches']]
    return "\n".join(matches)


# Define the function to handle general conversation using GPT-4
def openai_conversation_responder(query):
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are a friendly assistant."},
                  {"role": "user", "content": query}]
    )
    return response.choices[0].message.content

tools = [
    Tool(
        name="OpenAI Conversation Responder",
        func=openai_conversation_responder,
        description="useful for responding to general conversation in a friendly manner"
    ),
    Tool(
        name="Pinecone Vector Search",
        func=pinecone_search,
        description="useful for retrieving relevant information from the Pinecone vector database"
    )
]

# Set up the base template
template = """
You are Unilorin Student Support, a virtual assistant developed by *Olamide Bello*, a 400-level student in the Department of Information Technology, University of Ilorin (2024 set). You are here to assist students with questions strictly related to the University of Ilorin’s academic procedures, campus resources, student services, and official policies.

Always speak in the **first person**, like a friendly student peer, and give helpful, clear, and complete answers.

Only answer questions related to:
- Academic processes (e.g., course registration, exams, results, clearance, transcripts)
- Student services (e.g., hostel application, health center, counseling, library)
- University portals and IT support (e.g., password reset, student portal usage)
- Campus navigation (e.g., locations of faculties, departments, offices)
- Official university policies (e.g., dress code, discipline, attendance, grading)
- Clubs, extracurriculars, and student life at UNILORIN

❗ If the question is **not related to the University of Ilorin’s academic or student support issues**, politely respond that you cannot help with that because it is outside your scope.

Use the following tools:
{tools}

Follow this format for your reasoning and response:

Previous conversation history:
{history}

New question: {input}

Thought: Think about how to find the correct answer using the context or tools.
Action: The action to take (must be one of [{tool_names}])
Action Input: What to input into the action/tool
Observation: The result you got from the action/tool
... (repeat Thought/Action/Action Input/Observation as needed)
Thought: I now know the final answer.
Final Answer: (Give a complete, step-by-step, clear, and friendly explanation in first person)

Begin!

Question: {input}
{agent_scratchpad}
"""



# Set up a prompt template
class CustomPromptTemplate(StringPromptTemplate):
    template: str
    tools: List[Tool]

    def format(self, **kwargs) -> str:
        intermediate_steps = kwargs.pop("intermediate_steps", [])
        thoughts = ""
        for action, observation in intermediate_steps:
            thoughts += action.log
            thoughts += f"\nObservation: {observation}\nThought: "
        kwargs["agent_scratchpad"] = thoughts
        kwargs["tools"] = "\n".join([f"{tool.name}: {tool.description}" for tool in self.tools])
        kwargs["tool_names"] = ", ".join([tool.name for tool in self.tools])
        history = kwargs.pop("history", "")
        kwargs["history"] = history
        return self.template.format(**kwargs)

prompt = CustomPromptTemplate(
    template=template,
    tools=tools,
    input_variables=["input", "intermediate_steps", "history"]
)

class CustomOutputParser(AgentOutputParser):

    def parse(self, llm_output: str) -> Union[AgentAction, AgentFinish]:
        if "Final Answer:" in llm_output:
            return AgentFinish(
                return_values={"output": llm_output.split("Final Answer:")[-1].strip()},
                log=llm_output,
            )
        regex = r"Action\s*\d*\s*:(.*?)\nAction\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)"
        match = re.search(regex, llm_output, re.DOTALL)
        if not match:
            # If no match, return an AgentFinish with the current thought
            return AgentFinish(
                return_values={"output": llm_output.strip()},
                log=llm_output,
            )
        action = match.group(1).strip()
        action_input = match.group(2)
        return AgentAction(tool=action, tool_input=action_input.strip(" ").strip('"'), log=llm_output)

output_parser = CustomOutputParser()

llm = OpenAI(temperature=0.9)
llm_chain = LLMChain(llm=llm, prompt=prompt)

tool_names = [tool.name for tool in tools]

agent = LLMSingleActionAgent(
    llm_chain=llm_chain,
    output_parser=output_parser,
    stop=["\nObservation:"],
    allowed_tools=tool_names
)

memory = ConversationBufferWindowMemory(k=2)

agent_executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True,
    memory=memory
)

def get_user_memory(user_id):
    """Retrieve or initialize memory for a user."""
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferWindowMemory(k=2)
    return user_memories[user_id]

async def async_run_llm_agent(query):
    try:
        output = await agent_executor.arun({"input": query})
        return {"output": output}
    except Exception as e:
        print(f"Error in async_run_llm_agent: {e}")
        return {"output": "An error occurred while processing your request."}


@app.route('/')
def home():
    return "Hi! I'm Unilorin Student Support. How can I help you today?"

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "Unilorin Student Support Backend"})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data.get("message", "")
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    user_memory = get_user_memory(user_id)  # Get or initialize memory for the user
    
    # Create a temporary AgentExecutor with the user's memory
    user_agent_executor = AgentExecutor.from_agent_and_tools(
        agent=agent,
        tools=tools,
        verbose=True,
        memory=user_memory
    )
    
    try:
        # Run the agent synchronously for now
        output = user_agent_executor.run({"input": user_query})
        return jsonify({"output": output})
    except Exception as e:
        print(f"Error in chat route: {e}")
        return jsonify({"error": "An error occurred while processing your request."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port)