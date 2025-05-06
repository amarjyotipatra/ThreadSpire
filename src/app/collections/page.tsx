import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth";
import { Collection } from "../../../models";
import { PlusIcon } from "lucide-react";

export default async function CollectionsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Get all collections for the user
  const collections = await Collection.findAll({
    where: { userId: user.id },
    include: [
      {
        association: 'items',
        attributes: ['id'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Collections</h1>
          <p className="text-muted-foreground">
            Organize your favorite threads into themed collections.
          </p>
        </div>
        
        <Link
          href="/collections/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={16} />
          <span>New Collection</span>
        </Link>
      </div>
      
      {collections.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground mb-4">You don't have any collections yet.</p>
          <Link
            href="/collections/new"
            className="text-primary underline hover:opacity-80"
          >
            Create your first collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection: any) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="block border rounded-lg p-5 hover:border-primary transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
              {collection.description && (
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span>{collection.items.length}</span>
                  <span className="text-muted-foreground">threads</span>
                </div>
                <div className="flex items-center">
                  <span className={collection.isPrivate ? "text-muted-foreground" : "text-green-500"}>
                    {collection.isPrivate ? "Private" : "Public"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}