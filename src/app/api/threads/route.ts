import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../../../lib/auth';
import { Thread, ThreadSegment, sequelize } from '../../../../models';
import { Op } from 'sequelize';

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    const { title, tags, segments, isPublished, originalThreadId } = body;
    
    // Validate required fields
    if (!title || !segments || segments.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one segment are required' },
        { status: 400 }
      );
    }
    
    // Create thread
    const thread = await Thread.create({
      id: uuidv4(),
      userId: user.id,
      title,
      tags: tags || [],
      isPublished: !!isPublished,
      originalThreadId: originalThreadId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Create thread segments
    await Promise.all(
      segments.map((segment: { content: string; order: number }) =>
        ThreadSegment.create({
          id: uuidv4(),
          threadId: thread.id,
          content: segment.content,
          order: segment.order,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    );
    
    return NextResponse.json({ id: thread.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'newest';
    
    // Base query to find published threads
    const query: any = {
      where: { isPublished: true },
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
      order: [['createdAt', 'DESC']], // Default sort by newest
    };
    
    // Add tag filter if provided
    if (tag && tag !== 'All') {
      query.where.tags = { [Op.contains]: [tag] };
    }
    
    // Adjust sorting
    if (sort === 'popular') {
      query.include.push({
        association: 'bookmarks',
        attributes: [],
      });
      query.attributes = {
        include: [
          [sequelize.fn('COUNT', sequelize.col('bookmarks.id')), 'bookmarkCount'],
        ],
      };
      query.group = ['Thread.id', 'author.id', 'segments.id'];
      query.order = [[sequelize.literal('bookmarkCount'), 'DESC']];
    } else if (sort === 'forked') {
      query.include.push({
        association: 'forks',
        attributes: [],
        foreignKey: 'originalThreadId',
      });
      query.attributes = {
        include: [
          [sequelize.fn('COUNT', sequelize.col('forks.id')), 'forkCount'],
        ],
      };
      query.group = ['Thread.id', 'author.id', 'segments.id'];
      query.order = [[sequelize.literal('forkCount'), 'DESC']];
    }
    
    // Execute query
    const threads = await Thread.findAll(query);
    
    return NextResponse.json(threads, { status: 200 });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}