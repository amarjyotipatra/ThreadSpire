import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../../lib/auth';
import { Collection, CollectionItem } from '../../../../../models';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { collectionId, threadId } = body;
    
    // Validate required fields
    if (!collectionId || !threadId) {
      return NextResponse.json(
        { error: 'Collection ID and Thread ID are required' },
        { status: 400 }
      );
    }
    
    // Verify the collection belongs to the user
    const collection = await Collection.findOne({
      where: { 
        id: collectionId,
        userId: user.id 
      }
    });
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }
    
    // Check if thread is already in the collection
    const existingItem = await CollectionItem.findOne({
      where: {
        collectionId,
        threadId,
      },
    });
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'Thread already exists in this collection' },
        { status: 400 }
      );
    }
    
    // Add thread to collection
    const collectionItem = await CollectionItem.create({
      id: uuidv4(),
      collectionId,
      threadId,
      addedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ id: collectionItem.id }, { status: 201 });
  } catch (error) {
    console.error('Error adding thread to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add thread to collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const threadId = searchParams.get('threadId');
    const itemId = searchParams.get('itemId');
    
    if ((!collectionId || !threadId) && !itemId) {
      return NextResponse.json(
        { error: 'Either Collection ID and Thread ID, or Item ID are required' },
        { status: 400 }
      );
    }
    
    // Verify the collection belongs to the user
    if (collectionId) {
      const collection = await Collection.findOne({
        where: { 
          id: collectionId,
          userId: user.id 
        }
      });
      
      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found or access denied' },
          { status: 404 }
        );
      }
    }
    
    // Delete the collection item
    let where: {id?: string, collectionId?: string, threadId?: string} = {};
    
    if (itemId) {
      where.id = itemId;
    } else if (collectionId && threadId) {
      where.collectionId = collectionId;
      where.threadId = threadId;
    } else {
      return NextResponse.json(
        { error: 'Invalid parameters for deletion' },
        { status: 400 }
      );
    }
      
    const deleteResult = await CollectionItem.destroy({ where });
    
    if (deleteResult === 0) {
      return NextResponse.json(
        { error: 'Thread not found in collection' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing thread from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove thread from collection' },
      { status: 500 }
    );
  }
}