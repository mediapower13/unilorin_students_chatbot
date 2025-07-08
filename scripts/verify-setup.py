#!/usr/bin/env python3
"""
Quick setup verification for the Unilorin Chatbot
"""

import os
import sys
import subprocess

# Change to the parent directory (project root)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
os.chdir(project_root)

def check_command(command, name):
    """Check if a command exists and return version info"""
    try:
        result = subprocess.run([command, '--version'], 
                              capture_output=True, text=True, check=True, shell=True)
        return True, result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False, None

def check_file_exists(filepath, name):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    return exists, filepath if exists else None

def main():
    print("🔍 Verifying Unilorin Chatbot Setup")
    print("=" * 50)
    
    # Check Python
    python_ok, python_version = check_command('python', 'Python')
    if python_ok:
        print(f"✅ Python: {python_version}")
    else:
        print("❌ Python not found")
        return False
    
    # Check Node.js
    node_ok, node_version = check_command('node', 'Node.js')
    if node_ok:
        print(f"✅ Node.js: {node_version}")
    else:
        print("❌ Node.js not found")
        return False
    
    # Check npm
    npm_ok, npm_version = check_command('npm', 'npm')
    if npm_ok:
        print(f"✅ npm: {npm_version}")
    else:
        print("❌ npm not found")
        return False
    
    print("\n📁 Checking project files...")
    
    # Check important files
    files_to_check = [
        ('backend/main.py', 'Flask backend'),
        ('package.json', 'Node.js config'),
        ('backend/requirements.txt', 'Python dependencies'),
        ('.env', 'Backend environment'),
        ('.env.local', 'Frontend environment'),
        ('app/page.tsx', 'Main frontend component'),
        ('app/api/chat/route.ts', 'Chat API route'),
        ('scripts/start-dev.bat', 'Windows startup script'),
        ('scripts/start-dev.sh', 'Linux/Mac startup script'),
        ('docs/README.md', 'Documentation'),
    ]
    
    all_files_ok = True
    for filename, description in files_to_check:
        exists, path = check_file_exists(filename, description)
        if exists:
            print(f"✅ {description}: {filename}")
        else:
            print(f"❌ {description}: {filename} (missing)")
            all_files_ok = False
    
    print("\n🔑 Checking environment variables...")
    
    # Check .env file content
    env_ok = True
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            env_content = f.read()
            if 'your_openai_api_key_here' in env_content:
                print("⚠️  OPENAI_API_KEY needs to be updated in .env")
                env_ok = False
            else:
                print("✅ OPENAI_API_KEY appears to be set")
            
            if 'your_pinecone_api_key_here' in env_content:
                print("⚠️  PINECONE_API_KEY needs to be updated in .env")
                env_ok = False
            else:
                print("✅ PINECONE_API_KEY appears to be set")
    else:
        print("❌ .env file not found")
        env_ok = False
    
    print("\n" + "=" * 50)
    
    if python_ok and node_ok and npm_ok and all_files_ok:
        if env_ok:
            print("🎉 Setup verification complete! Everything looks good.")
            print("\n🚀 To start the application:")
            print("   Windows: scripts\\start-dev.bat")
            print("   PowerShell: scripts\\start-dev.ps1")  
            print("   Linux/Mac: scripts/start-dev.sh")
            print("   Manual: Open two terminals and run:")
            print("     Terminal 1: cd backend && python main.py")
            print("     Terminal 2: npm run dev")
            return True
        else:
            print("⚠️  Setup is mostly complete, but please update your API keys in .env")
            return False
    else:
        print("❌ Setup verification failed. Please check the missing items above.")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
