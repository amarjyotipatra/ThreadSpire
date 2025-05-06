import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Bookmark } from '../../../../models';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { threadId } = body;
    
    // Validate required fields
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user already has bookmarked this thread
    const existingBookmark = await Bookmark.findOne({
      where: {
        userId: user.id,
        threadId,
      },
    });
    
    if (existingBookmark) {
      // Remove the bookmark if it exists (toggle behavior)
      await existingBookmark.destroy();
      return NextResponse.json({ success: true, action: 'removed' }, { status: 200 });
    } else {
      // Create a new bookmark
      await Bookmark.create({
        id: uuidv4(),
        userId: user.id,
        threadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return NextResponse.json({ success: true, action: 'added' }, { status: 201 });
    }
  } catch (error) {
    console.error('Error handling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to process bookmark' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Get all bookmarks for the current user
    const bookmarks = await Bookmark.findAll({
      where: {
        userId: user.id,
      },
      include: [
        {
          association: 'thread',
          attributes: ['id', 'title', 'tags', 'createdAt'],
          include: [
            {
              association: 'author',
              attributes: ['id', 'name', 'profileImage'],
            },
            {
              association: 'segments',
              attributes: ['id', 'content', 'order'],
              where: { order: 0 }, // Get only first segment for preview
              limit: 1,
              required: false,
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    
    return NextResponse.json(bookmarks, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}