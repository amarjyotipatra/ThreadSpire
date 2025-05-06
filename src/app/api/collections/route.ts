import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Collection, CollectionItem } from '../../../../models';

// Create a new collection
export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { name, description, isPrivate } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }
    
    // Create collection
    const collection = await Collection.create({
      id: uuidv4(),
      userId: user.id,
      name,
      description: description || '',
      isPrivate: isPrivate !== false, // Default to private
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ id: collection.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

// Get all collections for the current user
export async function GET(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Get all collections for the user
    const collections = await Collection.findAll({
      where: { userId: user.id },
      include: [
        {
          association: 'items',
          attributes: ['id', 'threadId', 'addedAt'],
          include: [
            {
              association: 'thread',
              attributes: ['id', 'title'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    
    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}