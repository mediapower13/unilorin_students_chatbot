import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { addUser, findUserByEmail, findUserByMatricNumber, User } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, matricNumber, password } = await request.json()

    // Validation
    if (!fullName || !email || !matricNumber || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = findUserByEmail(email)
    const existingUserByMatric = findUserByMatricNumber(matricNumber)

    if (existingUserByEmail || existingUserByMatric) {
      return NextResponse.json(
        { error: 'User with this email or matric number already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = addUser({
      fullName,
      email,
      matricNumber,
      password: hashedPassword
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
