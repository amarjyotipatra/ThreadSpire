import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../../lib/auth';
import { Thread, ThreadSegment } from '../../../../../models';
import { AppError, ErrorType, formatErrorPayload, logServerError } from '../../../../../lib/errors';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { threadId } = body;
    
    // Validate required fields
    if (!threadId) {
      throw new AppError('Original Thread ID is required', ErrorType.VALIDATION_ERROR, 400);
    }
    
    // Find the original thread with its segments
    const originalThread = await Thread.findOne({
      where: { id: threadId, isPublished: true },
      include: [
        {
          association: 'segments',
          attributes: ['id', 'content', 'order'],
          order: [['order', 'ASC']],
        },
      ],
    }) as Thread & { segments?: ThreadSegment[] };
    
    if (!originalThread) {
      throw new AppError('Thread not found or not published', ErrorType.NOT_FOUND_ERROR, 404);
    }
    
    // Create a new (draft) thread as a fork
    const newThread = await Thread.create({
      id: uuidv4(),
      userId: user.id,
      title: `${originalThread.title} (Remix)`, // Default title can be changed by user
      tags: originalThread.tags,
      isPublished: false, // Start as draft
      originalThreadId: threadId, // Link to original thread
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Copy all segments from original thread to new thread
    if (originalThread.segments && originalThread.segments.length > 0) {
      await Promise.all(
        originalThread.segments.map((segment: any) =>
          ThreadSegment.create({
            id: uuidv4(),
            threadId: newThread.id,
            content: segment.content,
            order: segment.order,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        )
      );
    }
    
    return NextResponse.json({ 
      id: newThread.id,
      message: 'Thread forked successfully as draft'
    }, { status: 201 });
    
  } catch (error) {
    logServerError(error, 'threads/fork:POST');
    if (error instanceof AppError) {
      return NextResponse.json(formatErrorPayload(error), { status: error.code });
    }
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to fork thread', ErrorType.INTERNAL_SERVER_ERROR, 500)),
      { status: 500 }
    );
  }
}