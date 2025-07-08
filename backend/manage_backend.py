#!/usr/bin/env python3
"""
Comprehensive backend manager for Unilorin Chatbot
This script helps manage the backend server lifecycle.
"""

import subprocess
import sys
import time
import requests
import os
import signal
from pathlib import Path

def find_and_kill_servers():
    """Find and kill any existing backend servers"""
    print("🔍 Looking for existing backend servers...")
    
    try:
        # Find processes running on port 5000
        result = subprocess.run(
            ["netstat", "-ano"], 
            capture_output=True, 
            text=True, 
            shell=True
        )
        
        lines = result.stdout.split('\n')
        port_5000_lines = [line for line in lines if ':5000' in line and 'LISTENING' in line]
        
        if port_5000_lines:
            print("📋 Found servers on port 5000:")
            for line in port_5000_lines:
                print(f"  {line.strip()}")
        else:
            print("✅ No servers running on port 5000")
            
    except Exception as e:
        print(f"⚠️  Could not check for existing servers: {e}")

def test_api_connection():
    """Test if we can connect to OpenAI API"""
    print("🧪 Testing OpenAI API connection...")
    
    try:
        from dotenv import load_dotenv
        import openai
        
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key or api_key.startswith("your"):
            print("❌ OpenAI API key not configured")
            return False
            
        client = openai.OpenAI(api_key=api_key)
        
        # Simple test call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        
        print("✅ OpenAI API is working!")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API test failed: {e}")
        return False

def start_server(server_type="simple"):
    """Start the appropriate server"""
    print(f"🚀 Starting {server_type} server...")
    
    if server_type == "test":
        cmd = [sys.executable, "test-server.py"]
    elif server_type == "simple":
        cmd = [sys.executable, "simple-main.py"]
    else:
        cmd = [sys.executable, "main.py"]
    
    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Test if server is responding
        try:
            response = requests.get("http://localhost:5000/health", timeout=5)
            if response.status_code == 200:
                print("✅ Server started successfully!")
                print(f"🌐 Health check: {response.json()}")
                return process
            else:
                print(f"❌ Server responded with status {response.status_code}")
                
        except requests.RequestException as e:
            print(f"❌ Could not connect to server: {e}")
            stdout, stderr = process.communicate(timeout=5)
            print(f"Server output: {stdout.decode()}")
            print(f"Server errors: {stderr.decode()}")
            
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
    
    return None

def main():
    """Main function"""
    print("🔧 Unilorin Chatbot Backend Manager")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Step 1: Check for existing servers
    find_and_kill_servers()
    
    # Step 2: Test API connection
    api_works = test_api_connection()
    
    # Step 3: Start appropriate server
    if api_works:
        print("🎯 Starting AI-powered server...")
        process = start_server("simple")
    else:
        print("🧪 API not working, starting test server...")
        process = start_server("test")
    
    if process:
        print("✅ Backend is running!")
        print("🛑 Press Ctrl+C to stop")
        
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping server...")
            process.terminate()
            process.wait()
            print("✅ Server stopped")
    else:
        print("❌ Failed to start any server")

if __name__ == "__main__":
    main()
