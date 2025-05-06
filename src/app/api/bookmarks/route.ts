import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Bookmark } from '../../../../models';
import { AppError, ErrorType, formatErrorPayload, logServerError } from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { threadId } = body;
    
    // Validate required fields
    if (!threadId) {
      throw new AppError('Thread ID is required', ErrorType.VALIDATION_ERROR, 400);
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
    logServerError(error, 'bookmarks:POST');
    if (error instanceof AppError) {
      return NextResponse.json(formatErrorPayload(error), { status: error.code });
    }
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to process bookmark', ErrorType.INTERNAL_SERVER_ERROR, 500)),
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
    
    return NextResponse.json(bookmarks, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    });
  } catch (error) {
    logServerError(error, 'bookmarks:GET');
    // Note: No AppError check here, as we're not throwing custom AppErrors in the GET handler currently
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to fetch bookmarks', ErrorType.INTERNAL_SERVER_ERROR, 500)),
      { status: 500 }
    );
  }
}