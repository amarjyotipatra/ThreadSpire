import { notFound } from 'next/navigation';
import { Thread, ThreadSegment, Reaction } from '../../../../models';
import { getCurrentUser } from '../../../../lib/auth';
import ThreadActions from '@/components/thread/ThreadActions';
import ReactionSection from '@/components/thread/ReactionSection';
import RelatedThreads from '@/components/thread/RelatedThreads';

interface ThreadPageProps {
  params: {
    id: string;
  };
}

interface ThreadWithSegments extends Thread {
  segments: Array<{
    id: string;
    content: string;
    order: number;
    reactions: Array<{
      id: string;
      type: string;
      userId: string;
    }>;
  }>;
  author?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  originalThread?: {
    id: string;
    title: string;
    author?: {
      id: string;
      name: string;
    };
  };
  tags: string[];
}

async function getThreadData(id: string): Promise<ThreadWithSegments | null> {
  try {
    const thread = await Thread.findOne({
      where: { id, isPublished: true },
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
              attributes: ['id', 'type', 'userId'],
            },
          ],
          order: [['order', 'ASC']],
        },
        {
          association: 'originalThread',
          include: [
            {
              association: 'author',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    }) as ThreadWithSegments | null;

    return thread;
  } catch (error) {
    console.error('Error fetching thread:', error);
    return null;
  }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const thread = await getThreadData(params.id);
  const currentUser = await getCurrentUser();
  
  if (!thread) {
    notFound();
  }

  // Count reactions per emoji type
  const reactionCounts = thread.segments.map((segment: any) => {
    const counts: Record<string, number> = {};
    segment.reactions.forEach((reaction: any) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    return counts;
  });

  // Check if current user has reacted to each segment
  const userReactions = currentUser
    ? thread.segments.map((segment: any) => 
        segment.reactions.find((r: any) => r.userId === currentUser.id)?.type || null
      )
    : null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {thread.author?.profileImage ? (
              <img 
                src={thread.author.profileImage} 
                alt={thread.author.name} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-full" />
            )}
            <div>
              <div className="font-medium">{thread.author?.name || 'Anonymous'}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(thread.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <ThreadActions 
            threadId={thread.id}
            authorId={thread.userId}
            currentUserId={currentUser?.id}
          />
        </div>
        
        {thread.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag: string) => (
              <span 
                key={tag} 
                className="bg-secondary rounded-full px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {thread.originalThread && (
          <div className="mt-4 p-3 border-l-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Forked from{" "}
              <a 
                href={`/thread/${thread.originalThread.id}`}
                className="text-primary underline"
              >
                {thread.originalThread.title}
              </a>{" "}
              by {thread.originalThread.author?.name}
            </p>
          </div>
        )}
      </header>
      
      <div className="space-y-10">
        {thread.segments.map((segment: any, index: number) => (
          <div key={segment.id} className="border-b pb-8 last:border-0">
            <div 
              className="prose dark:prose-invert max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: segment.content }}
            />
            
            <ReactionSection 
              segmentId={segment.id}
              reactionCounts={reactionCounts[index]}
              userReaction={userReactions?.[index]}
              isAuthenticated={!!currentUser}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-16">
        <RelatedThreads currentThreadId={thread.id} tags={thread.tags} />
      </div>
    </div>
  );
}