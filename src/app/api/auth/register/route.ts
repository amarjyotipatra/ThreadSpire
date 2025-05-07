import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../models/User';
import { v4 as uuidv4 } from 'uuid';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[Auth Register] Received request');
  try {
    let email, name, password;
    try {
      const body = await req.json();
      email = body.email;
      name = body.name;
      password = body.password;
      console.log(`[Auth Register] Parsed email: ${email}, name: ${name}`);
    } catch (parseError) {
      console.error('[Auth Register] Failed to parse request body:', parseError);
      return NextResponse.json({ message: 'Invalid request format. Please provide email, name, and password.', error: parseError instanceof Error ? parseError.message : 'Unknown parsing error' }, { status: 400 });
    }

    if (!email || !name || !password) {
      console.log('[Auth Register] Missing required fields');
      return NextResponse.json({ message: 'Email, name, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`[Auth Register] User already exists with email: ${email}`);
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
    }
    
    // Create user
    const newUser = await User.create({
      id: uuidv4(),
      email,
      name,
      password, // Storing plain password as per current setup
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userObj = newUser.get({ plain: true });
    const { password: _, ...userResponse } = userObj;

    console.log(`[Auth Register] User registered successfully: ${email}, ID: ${newUser.id}`);
    return NextResponse.json({ 
      message: 'User registered successfully', 
      user: userResponse 
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Auth Register] General error:', error);
    let errorMessage = 'An internal server error occurred during registration.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error registering user', error: errorMessage }, { status: 500 });
  }
}
