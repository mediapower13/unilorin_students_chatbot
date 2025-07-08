import fs from 'fs'
import path from 'path'

export interface User {
  id: string
  matricNumber: string
  email: string
  fullName: string
  password: string
  createdAt: Date
}

const DB_PATH = path.join(process.cwd(), 'data', 'users.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read users from file
export function getUsers(): User[] {
  ensureDataDir()
  
  if (!fs.existsSync(DB_PATH)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users:', error)
    return []
  }
}

// Save users to file
export function saveUsers(users: User[]): void {
  ensureDataDir()
  
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
    throw new Error('Failed to save user data')
  }
}

// Add a new user
export function addUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  
  // Check if user already exists
  if (users.some(u => u.email === user.email || u.matricNumber === user.matricNumber)) {
    throw new Error('User already exists')
  }
  
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date()
  }
  
  users.push(newUser)
  saveUsers(users)
  
  return newUser
}

// Find user by email
export function findUserByEmail(email: string): User | undefined {
  const users = getUsers()
  return users.find(u => u.email === email)
}

// Find user by matric number
export function findUserByMatricNumber(matricNumber: string): User | undefined {
  const users = getUsers()
  return users.find(u => u.matricNumber === matricNumber)
}
