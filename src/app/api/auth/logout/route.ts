import { NextResponse } from 'next/server';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true, 
      message: 'Logged out successfully'
    });

    // Clear the auth session cookie
    response.cookies.delete('auth_session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Error logging out' }, { status: 500 });
  }
}