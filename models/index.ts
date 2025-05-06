import User from './User';
import Thread from './Thread';
import ThreadSegment from './ThreadSegment';
import Reaction from './Reaction';
import Bookmark from './Bookmark';
import Collection from './Collection';
import CollectionItem from './CollectionItem';
import { sequelize } from '../lib/db';  // Import sequelize instance

// Sync all models with the database
const syncDatabase = async () => {
  try {
    // Set force to true only in development and when you want to drop tables
    await User.sync({ alter: process.env.NODE_ENV === 'development' });
    await Thread.sync({ alter: process.env.NODE_ENV === 'development' });
    await ThreadSegment.sync({ alter: process.env.NODE_ENV === 'development' });
    await Reaction.sync({ alter: process.env.NODE_ENV === 'development' });
    await Bookmark.sync({ alter: process.env.NODE_ENV === 'development' });
    await Collection.sync({ alter: process.env.NODE_ENV === 'development' });
    await CollectionItem.sync({ alter: process.env.NODE_ENV === 'development' });
    
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Failed to sync database models:', error);
  }
};

export {
  User,
  Thread,
  ThreadSegment,
  Reaction,
  Bookmark,
  Collection,
  CollectionItem,
  syncDatabase,
  sequelize,  
};