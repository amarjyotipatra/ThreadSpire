import { NextResponse } from 'next/server';
import { Thread, Reaction } from '../../../../../models';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Remove any trailing characters like ":1" that might be causing the 404 errors
    const cleanId = id.split(':')[0];
    
    // Get the thread with all related data
    const thread = await Thread.findOne({
      where: { id: cleanId },
      include: [
        {
          association: 'author',
          attributes: ['id', 'name', 'profileImage'],
        },
        {
          association: 'segments',
          attributes: ['id', 'content', 'order'],
          include: [
            {
              association: 'reactions',
              attributes: ['id', 'userId', 'type'],
            },
          ],
          order: [['order', 'ASC']],
        },
        {
          association: 'originalThread',
          attributes: ['id', 'title', 'userId'],
          include: [
            {
              association: 'author',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Return the thread data
    return NextResponse.json(thread, { 
      status: 200,
      headers: {
        // Add cache headers to improve performance
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // Updated cache header
      }
    });
    
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}