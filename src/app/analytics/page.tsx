import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../lib/auth";
import { Thread, Reaction, Bookmark, sequelize } from "../../../models";
import { BarChart, LineChart } from "lucide-react";
import { Op } from "sequelize";

async function getThreadsCreated(userId: string) {
  return await Thread.count({ where: { userId } });
}

async function getThreadReactions(userId: string) {
  const result = await Thread.findAll({
    attributes: [
      'id',
      'title',
      [sequelize.fn('COUNT', sequelize.col('segments.reactions.id')), 'reactionCount'],
    ],
    where: { userId },
    include: [
      {
        association: 'segments',
        attributes: [],
        include: [{ association: 'reactions', attributes: [] }],
      },
    ],
    group: ['Thread.id', 'Thread.title'],
    order: [[sequelize.fn('COUNT', sequelize.col('segments.reactions.id')), 'DESC']],
    limit: 5,
    subQuery: false,
  });
  
  return result;
}

async function getThreadBookmarks(userId: string) {
  const result = await Thread.findAll({
    attributes: [
      'id',
      'title',
      [sequelize.fn('COUNT', sequelize.col('bookmarks.id')), 'bookmarkCount'],
    ],
    where: { userId },
    include: [{ association: 'bookmarks', attributes: [] }],
    group: ['Thread.id', 'Thread.title'],
    order: [[sequelize.fn('COUNT', sequelize.col('bookmarks.id')), 'DESC']],
    limit: 5,
    subQuery: false,
  });
  
  return result;
}

async function getThreadForks(userId: string) {
  const result = await Thread.findAll({
    attributes: [
      'id',
      'title',
      [sequelize.fn('COUNT', sequelize.col('forks.id')), 'forkCount'],
    ],
    where: { userId },
    include: [{ association: 'forks', attributes: [] }],
    group: ['Thread.id', 'Thread.title'],
    order: [[sequelize.fn('COUNT', sequelize.col('forks.id')), 'DESC']],
    limit: 5,
    subQuery: false,
  });
  
  return result;
}

async function getMonthlyActivity(userId: string) {
  // Get activity over the past 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const threadsCreated = await Thread.findAll({
    attributes: [
      [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
      [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: {
      userId,
      createdAt: { [Op.gte]: sixMonthsAgo },
    },
    group: [
      sequelize.fn('MONTH', sequelize.col('createdAt')),
      sequelize.fn('YEAR', sequelize.col('createdAt')),
    ],
    order: [
      [sequelize.fn('YEAR', sequelize.col('createdAt')), 'ASC'],
      [sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC'],
    ],
  });
  
  return threadsCreated;
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Get analytics data for the current user
  const threadsCreated = await getThreadsCreated(user.id);
  const topReactedThreads = await getThreadReactions(user.id);
  const topBookmarkedThreads = await getThreadBookmarks(user.id);
  const topForkedThreads = await getThreadForks(user.id);
  const monthlyActivity = await getMonthlyActivity(user.id);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="border rounded-lg p-5 bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Threads</h3>
          <p className="text-3xl font-bold">{threadsCreated}</p>
        </div>
        
        <div className="border rounded-lg p-5 bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Reactions</h3>
          <p className="text-3xl font-bold">{
            topReactedThreads.reduce((sum: number, thread: any) => sum + Number(thread.dataValues.reactionCount || 0), 0)
          }</p>
        </div>
        
        <div className="border rounded-lg p-5 bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Bookmarks</h3>
          <p className="text-3xl font-bold">{
            topBookmarkedThreads.reduce((sum: number, thread: any) => sum + Number(thread.dataValues.bookmarkCount || 0), 0)
          }</p>
        </div>
        
        <div className="border rounded-lg p-5 bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Forks</h3>
          <p className="text-3xl font-bold">{
            topForkedThreads.reduce((sum: number, thread: any) => sum + Number(thread.dataValues.forkCount || 0), 0)
          }</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="border rounded-lg p-5 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Top Reacted Threads</h3>
            <BarChart className="text-muted-foreground" size={20} />
          </div>
          
          <div className="space-y-4">
            {topReactedThreads.length > 0 ? (
              topReactedThreads.map((thread: any) => (
                <div key={thread.id} className="flex items-center justify-between">
                  <Link 
                    href={`/thread/${thread.id}`}
                    className="font-medium hover:underline line-clamp-1"
                  >
                    {thread.title}
                  </Link>
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-sm">
                    {thread.dataValues.reactionCount} reactions
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No reaction data available yet.</p>
            )}
          </div>
        </div>
        
        <div className="border rounded-lg p-5 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Top Bookmarked Threads</h3>
            <BarChart className="text-muted-foreground" size={20} />
          </div>
          
          <div className="space-y-4">
            {topBookmarkedThreads.length > 0 ? (
              topBookmarkedThreads.map((thread: any) => (
                <div key={thread.id} className="flex items-center justify-between">
                  <Link 
                    href={`/thread/${thread.id}`}
                    className="font-medium hover:underline line-clamp-1"
                  >
                    {thread.title}
                  </Link>
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-sm">
                    {thread.dataValues.bookmarkCount} bookmarks
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No bookmark data available yet.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-5 bg-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Activity Over Time</h3>
          <LineChart className="text-muted-foreground" size={20} />
        </div>
        
        <div className="h-64 flex items-center justify-center">
          {monthlyActivity.length > 0 ? (
            <div className="w-full h-full">
              {/* This would be replaced with a real chart component in production */}
              <div className="flex items-end justify-between h-full">
                {monthlyActivity.map((month: any, index: number) => {
                  const height = `${(month.dataValues.count / 10) * 100}%`;
                  const date = new Date(month.dataValues.year, month.dataValues.month - 1);
                  
                  return (
                    <div key={index} className="flex flex-col items-center w-1/6">
                      <div 
                        className="w-12 bg-primary/80 rounded-t-md transition-all"
                        style={{ height }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No activity data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}