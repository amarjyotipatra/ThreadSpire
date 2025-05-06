import Link from "next/link";
import { Thread } from "../../../models";
import { getCurrentUser } from "../../../lib/auth";
import SortThreadsDropdown from "@/components/thread/SortThreadsDropdown";

interface ExplorePageProps {
  searchParams: {
    tag?: string;
    sort?: string;
  };
}

async function getThreads(tag?: string, sort?: string) {
  const sortOptions = ['newest', 'popular', 'forked'];
  const sortBy = sortOptions.includes(sort || '') ? sort : 'newest';
  
  // Build the query parameters
  const params = new URLSearchParams();
  if (tag && tag !== 'All') {
    params.append('tag', tag);
  }
  if (sortBy) {
    params.append('sort', sortBy);
  }
  
  // Fetch threads from our API endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/threads?${params.toString()}`, { 
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch threads');
  }
  
  return await response.json();
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const tag = searchParams.tag || 'All';
  const sort = searchParams.sort || 'newest';
  const user = await getCurrentUser();
  const threads = await getThreads(tag, sort);
  
  const tags = ['All', 'Productivity', 'Mindset', 'Career', 'Creativity', 'Wellness'];
  
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Explore Threads</h1>
        <p className="text-lg text-muted-foreground">
          Discover wisdom from the community.
        </p>
      </header>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tagOption) => (
            <Link
              key={tagOption}
              href={`/explore?tag=${tagOption}&sort=${sort}`}
              className={`px-3 py-1 rounded-full text-sm ${
                tag === tagOption
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tagOption}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <SortThreadsDropdown currentSort={sort} currentTag={tag} />
        </div>
      </div>
      
      {threads.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">No threads found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {threads.map((thread: any) => {
            // Extract first segment content for preview
            const firstSegment = thread.segments?.[0];
            const segmentText = firstSegment 
              ? firstSegment.content.replace(/<[^>]*>/g, '') 
              : 'No content available';
              
            return (
              <div key={thread.id} className="border rounded-lg p-5 hover:border-primary transition-colors">
                <Link href={`/thread/${thread.id}`} className="block h-full">
                  <h3 className="text-xl font-semibold mb-2">{thread.title}</h3>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {segmentText}
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
                    
                    {thread.bookmarkCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🔖</span>
                        <span>{thread.bookmarkCount}</span>
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