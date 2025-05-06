import { auth, currentUser } from '@clerk/nextjs/server';
import { User } from '../models';

// Get current user from Clerk and create/update in our database
export async function getCurrentUser() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Get user info from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    // Find or create user in our database
    const [user] = await User.findOrCreate({
        where: { id: userId },
        defaults: {
            id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
            profileImage: clerkUser.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    // Update user info if it's changed
    if (
        user.email !== clerkUser.emailAddresses[0]?.emailAddress ||
        user.name !== `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
        user.profileImage !== clerkUser.imageUrl
    ) {
        user.email = clerkUser.emailAddresses[0]?.emailAddress || user.email;
        user.name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.name;
        user.profileImage = clerkUser.imageUrl || user.profileImage;
        user.updatedAt = new Date();
        await user.save();
    }

    return user;
}

// Check if current user exists
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}