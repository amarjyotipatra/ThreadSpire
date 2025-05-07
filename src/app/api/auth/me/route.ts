import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import User from '../../../../../models/User';

// Add route config to mark this as a dynamic route to prevent static generation issues
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = cookies().get('auth_session')?.value;
    
    if (!userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      // Clear the invalid cookie if user doesn't exist
      const response = NextResponse.json({ message: 'User not found' }, { status: 404 });
      response.cookies.delete('auth_session');
      return response;
    }
    
    // Don't include the password in the response
    const userObj = user.get({ plain: true });
    const { password, ...userWithoutPassword } = userObj;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Error fetching user data' }, { status: 500 });
  }
}