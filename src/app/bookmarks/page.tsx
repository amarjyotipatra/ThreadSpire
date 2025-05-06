import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth";
import { Bookmark } from "../../../models";
import { notFound } from "next/navigation";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  
  // Add null check for user
  if (!user) {
    // The middleware should handle the redirect, but just in case
    return notFound();
  }
  
  // Get user's bookmarks with related thread data
  const bookmarks = await Bookmark.findAll({
    where: { userId: user.id },
    include: [
      {
        association: 'thread',
        include: [
          {
            association: 'author',
            attributes: ['id', 'name', 'profileImage'],
          },
          {
            association: 'segments',
            attributes: ['id', 'content', 'order'],
            where: { order: 0 },
            limit: 1,
            required: false,
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return (
    <div className="main-content">
      <div className="max-w-4xl mx-auto py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Your Bookmarks</h1>
          <p className="text-lg text-muted-foreground">Wisdom threads you've saved for later.</p>
        </header>
        
        {bookmarks.length === 0 ? (
          <div className="py-12 text-center border rounded-lg shadow-sm">
            <p className="text-muted-foreground mb-4">You haven't bookmarked any threads yet.</p>
            <Link
              href="/explore"
              className="text-link inline-block"
            >
              Explore threads to bookmark
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookmarks.map((bookmark: any) => (
              <div key={bookmark.id} className="mb-6">
                <Link 
                  href={`/thread/${bookmark.thread.id}`} 
                  className="card-link"
                >
                  <h3 className="text-xl font-semibold mb-2">{bookmark.thread.title}</h3>
                  
                  {bookmark.thread.segments?.[0] && (
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {bookmark.thread.segments[0].content.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center gap-2">
                      {bookmark.thread.author?.profileImage ? (
                        <img 
                          src={bookmark.thread.author.profileImage} 
                          alt={bookmark.thread.author.name}
                          className="w-6 h-6 rounded-full" 
                        />
                      ) : (
                        <span className="bg-secondary rounded-full w-6 h-6" />
                      )}
                      <span>{bookmark.thread.author?.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Bookmarked on {new Date(bookmark.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}