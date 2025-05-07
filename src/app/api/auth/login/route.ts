import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../models/User';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[Auth Login] Received request');
  try {
    let email, password;
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
      console.log(`[Auth Login] Parsed email: ${email}`);
    } catch (parseError) {
      console.error('[Auth Login] Failed to parse request body:', parseError);
      return NextResponse.json({ message: 'Invalid request format. Please provide email and password.', error: parseError instanceof Error ? parseError.message : 'Unknown parsing error' }, { status: 400 });
    }

    if (!email || !password) {
      console.log('[Auth Login] Missing email or password');
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[Auth Login] User not found for email: ${email}`);
      return NextResponse.json({ message: 'Invalid credentials - user not found' }, { status: 401 });
    }

    // Extremely simple direct string comparison
    if (user.password !== password) {
      console.log(`[Auth Login] Password mismatch for email: ${email}`);
      return NextResponse.json({ message: 'Invalid credentials - password incorrect' }, { status: 401 });
    }

    // Omit password from the returned user object
    const userObj = user.get({ plain: true });
    const { password: _, ...userResponse } = userObj;

    console.log(`[Auth Login] Login successful for email: ${email}, user ID: ${user.id}`);
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

    return response;
  } catch (error) {
    console.error('[Auth Login] General error:', error);
    let errorMessage = 'An internal server error occurred during login.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error logging in', error: errorMessage }, { status: 500 });
  }
}
