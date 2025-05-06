import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Reaction } from '../../../../models';
import { ReactionType } from '../../../../models/Reaction';
import { 
  AppError, 
  ErrorType, 
  formatErrorPayload, 
  logServerError 
} from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { segmentId, type } = body;
    
    // Validate required fields
    if (!segmentId) {
      throw new AppError(
        'Segment ID is required', 
        ErrorType.VALIDATION_ERROR, 
        400
      );
    }
    
    // Use a transaction to ensure data consistency
    const transaction = await Reaction.sequelize?.transaction();
    
    try {
      // Check if user already has a reaction for this segment with a lock to prevent race conditions
      const existingReaction = await Reaction.findOne({
        where: {
          userId: user.id,
          segmentId,
        },
        lock: true,
        transaction,
      });
      
      // If removing reaction (type is null) or changing to a different type
      if (existingReaction) {
        if (!type) {
          // Remove the reaction if type is null
          await existingReaction.destroy({ transaction });
          await transaction?.commit();
          return NextResponse.json({ success: true, action: 'removed' }, { status: 200 });
        } else if (Object.values(ReactionType).includes(type as ReactionType)) {
          // Update the reaction type
          existingReaction.type = type as ReactionType;
          await existingReaction.save({ transaction });
          await transaction?.commit();
          return NextResponse.json({ success: true, action: 'updated' }, { status: 200 });
        } else {
          await transaction?.rollback();
          throw new AppError(
            'Invalid reaction type', 
            ErrorType.VALIDATION_ERROR, 
            400
          );
        }
      }
      
      // Create a new reaction if one doesn't exist and type is provided
      if (type && Object.values(ReactionType).includes(type as ReactionType)) {
        await Reaction.create({
          id: uuidv4(),
          userId: user.id,
          segmentId,
          type: type as ReactionType,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, { transaction });
        
        await transaction?.commit();
        return NextResponse.json({ success: true, action: 'added' }, { status: 201 });
      }
      
      await transaction?.rollback();
      throw new AppError(
        'Invalid request - type is required for new reactions', 
        ErrorType.VALIDATION_ERROR, 
        400
      );
    } catch (error) {
      // Rollback transaction on error
      await transaction?.rollback();
      throw error;
    }
  } catch (error) {
    logServerError(error, 'reactions:POST');
    
    if (error instanceof AppError) {
      return NextResponse.json(
        formatErrorPayload(error),
        { status: error.code }
      );
    }
    
    return NextResponse.json(
      formatErrorPayload(new AppError(
        'Failed to process reaction', 
        ErrorType.INTERNAL_SERVER_ERROR, 
        500
      )),
      { status: 500 }
    );
  }
}