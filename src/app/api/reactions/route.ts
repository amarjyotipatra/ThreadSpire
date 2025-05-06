import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Reaction } from '../../../../models';
import { ReactionType } from '../../../../models/Reaction';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { segmentId, type } = body;
    
    // Validate required fields
    if (!segmentId) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user already has a reaction for this segment
    const existingReaction = await Reaction.findOne({
      where: {
        userId: user.id,
        segmentId,
      },
    });
    
    // If removing reaction (type is null) or changing to a different type
    if (existingReaction) {
      if (!type) {
        // Remove the reaction if type is null
        await existingReaction.destroy();
        return NextResponse.json({ success: true, action: 'removed' }, { status: 200 });
      } else if (Object.values(ReactionType).includes(type as ReactionType)) {
        // Update the reaction type
        existingReaction.type = type as ReactionType;
        await existingReaction.save();
        return NextResponse.json({ success: true, action: 'updated' }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: 'Invalid reaction type' },
          { status: 400 }
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
      });
      
      return NextResponse.json({ success: true, action: 'added' }, { status: 201 });
    }
    
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json(
      { error: 'Failed to process reaction' },
      { status: 500 }
    );
  }
}