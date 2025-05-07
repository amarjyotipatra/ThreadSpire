import { cookies } from 'next/headers';
import User from '../models/User';

/**
 * Retrieves the currently authenticated user from the session cookie.
 * Returns the user object (without password) if authenticated, otherwise null.
 */
export async function getCurrentUser(): Promise<Omit<User, 'password'> | null> {
  const userId = cookies().get('auth_session')?.value;

  if (!userId) {
    return null;
  }

  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return null;
    }

    // Convert to plain object and remove password
    const userObj = user.get({ plain: true });
    const { password, ...userWithoutPassword } = userObj;
    
    return userWithoutPassword as Omit<User, 'password'>;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Check if current user exists
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}