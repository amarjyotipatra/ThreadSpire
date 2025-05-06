import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../../lib/auth';
import { Collection, CollectionItem } from '../../../../../models';
import { AppError, ErrorType, formatErrorPayload, logServerError } from '../../../../../lib/errors';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { collectionId, threadId } = body;
    
    // Validate required fields
    if (!collectionId || !threadId) {
      throw new AppError('Collection ID and Thread ID are required', ErrorType.VALIDATION_ERROR, 400);
    }
    
    // Verify the collection belongs to the user
    const collection = await Collection.findOne({
      where: { 
        id: collectionId,
        userId: user.id 
      }
    });
    
    if (!collection) {
      throw new AppError('Collection not found or access denied', ErrorType.NOT_FOUND_ERROR, 404);
    }
    
    // Check if thread is already in the collection
    const existingItem = await CollectionItem.findOne({
      where: {
        collectionId,
        threadId,
      },
    });
    
    if (existingItem) {
      throw new AppError('Thread already exists in this collection', ErrorType.VALIDATION_ERROR, 400);
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
    logServerError(error, 'collections/items:POST');
    if (error instanceof AppError) {
      return NextResponse.json(formatErrorPayload(error), { status: error.code });
    }
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to add thread to collection', ErrorType.INTERNAL_SERVER_ERROR, 500)),
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
      throw new AppError('Either Collection ID and Thread ID, or Item ID are required', ErrorType.VALIDATION_ERROR, 400);
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
        throw new AppError('Collection not found or access denied', ErrorType.NOT_FOUND_ERROR, 404);
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
      throw new AppError('Invalid parameters for deletion', ErrorType.VALIDATION_ERROR, 400);
    }
      
    const deleteResult = await CollectionItem.destroy({ where });
    
    if (deleteResult === 0) {
      throw new AppError('Thread not found in collection', ErrorType.NOT_FOUND_ERROR, 404);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logServerError(error, 'collections/items:DELETE');
    if (error instanceof AppError) {
      return NextResponse.json(formatErrorPayload(error), { status: error.code });
    }
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to remove thread from collection', ErrorType.INTERNAL_SERVER_ERROR, 500)),
      { status: 500 }
    );
  }
}