import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Collection } from '../../../../models';
import { AppError, ErrorType, formatErrorPayload, logServerError } from '../../../../lib/errors';

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
      throw new AppError('Collection name is required', ErrorType.VALIDATION_ERROR, 400);
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
    logServerError(error, 'collections:POST');
    if (error instanceof AppError) {
      return NextResponse.json(formatErrorPayload(error), { status: error.code });
    }
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to create collection', ErrorType.INTERNAL_SERVER_ERROR, 500)),
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
    logServerError(error, 'collections:GET');
    // Note: No AppError check here, as we're not throwing custom AppErrors in the GET handler currently
    return NextResponse.json(
      formatErrorPayload(new AppError('Failed to fetch collections', ErrorType.INTERNAL_SERVER_ERROR, 500)),
      { status: 500 }
    );
  }
}