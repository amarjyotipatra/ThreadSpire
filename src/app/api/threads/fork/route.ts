import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../../lib/auth';
import { Thread, ThreadSegment } from '../../../../../models';

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
        { error: 'Original Thread ID is required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Thread not found or not published' },
        { status: 404 }
      );
    }
    
    // Create new thread as a draft (forked/remixed version)
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
    console.error('Error forking thread:', error);
    return NextResponse.json(
      { error: 'Failed to fork thread' },
      { status: 500 }
    );
  }
}