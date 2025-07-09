# Unilorin Student Support Chatbot


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