# Unilorin Student Support Chatbot

A full-stack chatbot application for University of Ilorin students, featuring a Next.js frontend and Flask backend with AI-powered responses.

## Project Structure

```
unilorin-chatbot-frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes
│       ├── chat/          # Chat proxy endpoint
│       └── health/        # Health check endpoint
├── backend/               # Flask backend application
│   ├── main.py           # Flask server
│   ├── requirements.txt  # Python dependencies
│   └── test.py           # Backend tests
├── components/            # React components
├── lib/                   # Utility functions
├── scripts/              # Development and utility scripts
│   ├── start-dev.bat     # Windows startup script
│   ├── start-dev.sh      # Linux/Mac startup script
│   ├── start-dev.ps1     # PowerShell startup script
│   ├── verify-setup.py   # Setup verification
│   └── test_backend.py   # Backend testing script
├── docs/                 # Documentation
│   ├── README.md         # Main documentation
│   ├── QUICKSTART.md     # Quick setup guide
│   ├── INTEGRATION.md    # Integration details
│   └── SUCCESS.md        # Success verification
├── config/               # Configuration files
│   ├── components.json   # shadcn/ui config
│   └── render.yaml       # Deployment config
├── package.json          # Node.js dependencies
├── .env                  # Backend environment variables
└── .env.local            # Frontend environment variables
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **OpenAI API Key**
4. **Pinecone API Key**

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd unilorin-chatbot-frontend
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Configure Environment Variables:**
   
   Update `.env` with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   FLASK_ENV=development
   PORT=5000
   ```

   The `.env.local` file is already configured for local development.

### Running the Application

#### Option 1: Using Startup Scripts (Recommended)

**Windows:**
```bash
scripts/start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

#### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:3000/api/health

## Features

### Frontend Features
- Modern, responsive chat interface
- Real-time message status indicators
- Quick action buttons for common queries
- Message copying functionality
- Online/offline status detection
- Character count for input messages
- Auto-scrolling chat history
- Error handling with retry functionality

### Backend Features
- AI-powered responses using OpenAI
- Vector database integration with Pinecone
- Memory management for conversation history
- User session management
- Health check endpoint
- CORS enabled for frontend communication

## API Endpoints

### Frontend API Routes
- `POST /api/chat` - Proxy chat requests to backend
- `GET /api/health` - Check system health

### Backend API Routes
- `POST /api/chat` - Process chat messages
- `GET /health` - Backend health check
- `GET /` - Root endpoint

## Development

### Frontend Development
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run linting
```

### Backend Development
```bash
python main.py  # Start Flask server
```

## Troubleshooting

### Common Issues

1. **Backend Connection Error:**
   - Ensure Flask server is running on port 5000
   - Check that API keys are properly configured in `.env`
   - Verify firewall isn't blocking the connection

2. **Frontend Not Loading:**
   - Ensure all dependencies are installed: `npm install`
   - Check that port 3000 is available
   - Clear browser cache and reload

3. **API Key Issues:**
   - Verify OpenAI API key is valid and has credits
   - Check Pinecone API key and index configuration
   - Ensure environment variables are properly loaded

4. **CORS Issues:**
   - Flask backend has CORS enabled by default
   - Check that frontend is running on localhost:3000

### Health Check

Visit http://localhost:3000/api/health to verify:
- Frontend status
- Backend connectivity
- API configuration

## Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
FLASK_ENV=development
PORT=5000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

## Production Deployment

For production deployment, update the environment variables to use your production backend URL and ensure proper security configurations.

## Support

For issues or questions, please check the troubleshooting section above or contact the development team.

---

**Developed by Olamide Bello, IT Department, University of Ilorin**
