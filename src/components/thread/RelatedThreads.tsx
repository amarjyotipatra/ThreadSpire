import Link from "next/link";
import { Thread } from "../../../models";
import { Op } from "sequelize";

interface RelatedThreadsProps {
  currentThreadId: string;
  tags: string[];
}

async function getRelatedThreads(currentThreadId: string, tags: string[]) {
  try {
    // Find threads with similar tags, excluding the current thread
    const relatedThreads = await Thread.findAll({
      where: {
        id: { [Op.ne]: currentThreadId },
        isPublished: true,
        tags: { [Op.overlap]: tags },
      },
      include: [
        {
          association: 'author',
          attributes: ['id', 'name', 'profileImage'],
        },
      ],
      limit: 3,
      order: [['createdAt', 'DESC']],
    });

    return relatedThreads;
  } catch (error) {
    console.error('Error fetching related threads:', error);
    return [];
  }
}

const RelatedThreads = async ({ currentThreadId, tags }: RelatedThreadsProps) => {
  const relatedThreads = tags?.length ? await getRelatedThreads(currentThreadId, tags) : [];

  if (relatedThreads.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Related Threads</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedThreads.map((thread: any) => (
          <Link 
            key={thread.id} 
            href={`/thread/${thread.id}`} 
            className="block border rounded-lg p-4 hover:border-primary transition-colors"
          >
            <h4 className="font-medium mb-2 line-clamp-2">{thread.title}</h4>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-secondary rounded-full" />
              <span>{thread.author?.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedThreads;