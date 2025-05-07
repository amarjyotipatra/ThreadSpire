import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../models/User'; // Adjust path as necessary
import { sequelize } from '../../../../../lib/db'; // Adjust path as necessary
import { v4 as uuidv4 } from 'uuid';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await sequelize.sync(); // Ensure tables are created

    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
    }
    // Create user with simple password (no hashing for simplicity)
    const newUser = await User.create({
      id: uuidv4(),
      email,
      name,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Omit password from the returned user object
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      profileImage: newUser.profileImage,
      bio: newUser.bio,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json({ message: 'User registered successfully', user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error registering user', error: errorMessage }, { status: 500 });
  }
}
