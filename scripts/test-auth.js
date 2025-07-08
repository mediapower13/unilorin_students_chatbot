#!/usr/bin/env node

// Test script for the authentication system
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Authentication System');
console.log('================================');

// Check if required files exist
const filesToCheck = [
  'app/page.tsx',
  'app/chat/page.tsx', 
  'app/register/page.tsx',
  'app/login/page.tsx',
  'app/api/auth/register/route.ts',
  'app/api/auth/login/route.ts',
  'lib/database.ts'
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (missing)`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['bcryptjs', 'jsonwebtoken'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} (missing)`);
    allFilesExist = false;
  }
});

// Check data directory
console.log('\n💾 Checking data directory...');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
} else {
  console.log('✅ Data directory exists');
}

console.log('\n🎯 Summary:');
if (allFilesExist) {
  console.log('✅ All required files and dependencies are present!');
  console.log('\n🚀 You can now:');
  console.log('   1. Start frontend: npm run dev');
  console.log('   2. Start backend: cd backend && python main.py');
  console.log('   3. Visit: http://localhost:3000');
} else {
  console.log('❌ Some files or dependencies are missing. Please check the output above.');
}

console.log('\n📋 Authentication Flow:');
console.log('   1. Landing page (/) - Shows login/register options');
console.log('   2. Register (/register) - Student registration with matric number');
console.log('   3. Login (/login) - Email and password authentication');
console.log('   4. Chat (/chat) - Protected chat interface');
console.log('   5. Auto-redirect if already logged in');
