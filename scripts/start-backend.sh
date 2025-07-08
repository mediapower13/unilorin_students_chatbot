#!/bin/bash
# 🚀 Start Backend Server Script
# This script helps you start the Unilorin Chatbot backend server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Unilorin Chatbot Backend Startup${NC}"
echo "=========================================="

# Change to backend directory
cd "$(dirname "$0")/../backend"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo -e "${BLUE}📝 Creating .env file from template...${NC}"
    
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${RED}❗ IMPORTANT: Please edit the .env file and add your API keys:${NC}"
        echo "   - OPENAI_API_KEY=your_openai_api_key"
        echo "   - PINECONE_API_KEY=your_pinecone_api_key"
        echo ""
        echo -e "${YELLOW}🔧 Would you like to start the test server instead? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🧪 Starting test server...${NC}"
            python test-server.py
            exit 0
        else
            echo -e "${RED}❌ Please configure your API keys in .env file first${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ No .env template found${NC}"
        exit 1
    fi
fi

# Check if API keys are set
source .env
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "sk-your-actual-openai-key-here" ] || \
   [ -z "$PINECONE_API_KEY" ] || [ "$PINECONE_API_KEY" = "your-actual-pinecone-key-here" ]; then
    echo -e "${RED}❌ API keys not configured properly${NC}"
    echo -e "${YELLOW}🔧 Starting test server instead...${NC}"
    python test-server.py
    exit 0
fi

# Start the real backend server
echo -e "${GREEN}✅ API keys configured${NC}"
echo -e "${BLUE}🚀 Starting AI-powered backend server...${NC}"
python main.py
