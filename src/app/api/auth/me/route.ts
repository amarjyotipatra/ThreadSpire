import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import User from '../../../../../models/User';
import { sequelize } from '../../../../../lib/db'; // Ensure db is initialized

// Add route config to mark this as a dynamic route to prevent static generation issues
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Attempting to access /api/auth/me');
  try {
    // Ensure database is connected before proceeding
    await sequelize.authenticate(); // Simple check
    console.log('Database authenticated for /api/auth/me');

    const userId = cookies().get('auth_session')?.value;
    
    if (!userId) {
      console.log('/api/auth/me: No user ID in session cookie.');
      return NextResponse.json({ message: 'Not authenticated', user: null }, { status: 401 });
    }
    console.log(`/api/auth/me: Found user ID ${userId} in session cookie.`);

    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log(`/api/auth/me: User with ID ${userId} not found in database.`);
      // Clear the invalid cookie if user doesn't exist
      const response = NextResponse.json({ message: 'User not found', user: null }, { status: 404 });
      response.cookies.delete('auth_session');
      return response;
    }
    console.log(`/api/auth/me: User ${user.email} found in database.`);
    
    // Don't include the password in the response
    const userObj = user.get({ plain: true });
    const { password, ...userWithoutPassword } = userObj;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error in /api/auth/me GET handler:', error);
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: 'Error fetching user data from /api/auth/me', errorDetails: errorMessage, user: null },
      { status: 500 }
    );
  }
}