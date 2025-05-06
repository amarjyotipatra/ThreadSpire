import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Thread, Reaction, sequelize } from "../../models";
import { Op } from "sequelize";

// Function to get featured threads with engagement data
async function getFeaturedThreads(limit = 6, sort = 'popular') {
  try {
    let query: any = {
      where: { isPublished: true },
      include: [
        {
          association: 'author',
          attributes: ['id', 'name', 'profileImage'],
        },
        {
          association: 'segments',
          attributes: ['id', 'content', 'order'],
          where: { order: { [Op.lt]: 2 } }, // Get first 2 segments
          required: false,
          include: [
            {
              association: 'reactions',
              attributes: ['type'],
            },
          ],
        },
      ],
      limit,
    };
    
    // Adjust query based on sort parameter
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
      query.group = ['Thread.id', 'author.id', 'segments.id', 'segments.reactions.id'];
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
      query.group = ['Thread.id', 'author.id', 'segments.id', 'segments.reactions.id'];
      query.order = [[sequelize.literal('forkCount'), 'DESC']];
    } else {
      query.order = [['createdAt', 'DESC']];
    }
    
    const threads = await Thread.findAll(query);
    return threads;
  } catch (error) {
    console.error('Error fetching featured threads:', error);
    return [];
  }
}

export default async function Home() {
  // Get featured threads
  const threads = await getFeaturedThreads();
  
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to ThreadSpire</h1>
        <p className="text-lg text-muted-foreground">
          A thoughtful corner of the internet for wisdom threads.
        </p>
        
        <SignedOut>
          <div className="mt-6">
            <SignInButton mode="modal">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                Sign in to create threads
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </header>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Featured Threads</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/explore" className="flex items-center text-primary underline">
            Explore All Threads
          </Link>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {['All', 'Productivity', 'Mindset', 'Career', 'Creativity', 'Wellness'].map((tag) => (
            <Link
              key={tag}
              href={`/explore?tag=${tag}`}
              className={`px-3 py-1 rounded-full text-sm ${
                tag === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
      
      {threads.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground mb-4">No threads available yet.</p>
          <SignedIn>
            <Link
              href="/create"
              className="text-primary underline hover:opacity-80"
            >
              Create the first thread
            </Link>
          </SignedIn>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {threads.map((thread: any) => {
            // Count reactions by type for display
            const reactionCounts: Record<string, number> = {};
            thread.segments?.forEach((segment: any) => {
              segment.reactions?.forEach((reaction: any) => {
                reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
              });
            });
            
            // Get top 2 reaction types
            const topReactions = Object.entries(reactionCounts)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 2);
              
            // Get preview from first segment
            const firstSegment = thread.segments?.find((s: any) => s.order === 0);
            const previewText = firstSegment 
              ? firstSegment.content.replace(/<[^>]*>/g, '')
              : 'No content available';

            return (
              <div key={thread.id} className="border rounded-lg p-5 hover:border-primary transition-colors">
                <Link href={`/thread/${thread.id}`} className="block h-full">
                  <h3 className="text-xl font-semibold mb-2">{thread.title}</h3>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {previewText}
                  </p>
                  
                  {thread.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {thread.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="bg-secondary text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {thread.author?.profileImage ? (
                        <img 
                          src={thread.author.profileImage}
                          alt={thread.author.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span className="bg-secondary rounded-full w-6 h-6" />
                      )}
                      <span>{thread.author?.name || 'Anonymous'}</span>
                    </div>
                    
                    {topReactions.length > 0 && (
                      <div className="flex items-center gap-3">
                        {topReactions.map(([emoji, count], index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}