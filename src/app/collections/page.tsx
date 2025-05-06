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
    <div className="main-content">
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center justify-between mb-10">
          <header>
            <h1 className="text-3xl font-bold mb-2">Your Collections</h1>
            <p className="text-lg text-muted-foreground">
              Organize your favorite threads into themed collections.
            </p>
          </header>
          
          <Link
            href="/collections/new"
            className="button-link"
          >
            <PlusIcon size={16} />
            <span>New Collection</span>
          </Link>
        </div>
        
        {collections.length === 0 ? (
          <div className="py-12 text-center border rounded-lg shadow-sm">
            <p className="text-muted-foreground mb-4">You don't have any collections yet.</p>
            <Link
              href="/collections/new"
              className="text-link inline-block"
            >
              Create your first collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection: any) => (
              <div key={collection.id} className="mb-4">
                <Link
                  href={`/collections/${collection.id}`}
                  className="card-link"
                >
                  <h3 className="text-xl font-semibold mb-3">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{collection.items.length}</span>
                      <span className="text-muted-foreground">threads</span>
                    </div>
                    <div className="flex items-center">
                      <span className={collection.isPrivate ? "text-muted-foreground" : "text-green-500"}>
                        {collection.isPrivate ? "Private" : "Public"}
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