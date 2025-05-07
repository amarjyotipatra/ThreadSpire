import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../models/User';
import { sequelize } from '../../../../../lib/db';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await sequelize.sync(); // Ensure tables are created

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }); // User not found
    }

    // Extremely simple direct string comparison without any trimming or other processing
    if (user.password !== password) {
      // Add console log to help debug (will only appear in server logs)
      console.log(`Login failed for ${email}: Password mismatch`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }); // Password incorrect
    }

    // Omit password from the returned user object
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Create a response and set a simple auth cookie with user ID
    const response = NextResponse.json({
      message: 'Login successful',
      user: userResponse
    }, { status: 200 });

    // Set a simple session cookie with user ID
    response.cookies.set({
      name: 'auth_session',
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 1 week in seconds
    });

    console.log(`Login successful for ${email}`);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error logging in', error: errorMessage }, { status: 500 });
  }
}
