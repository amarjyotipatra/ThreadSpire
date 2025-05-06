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
    // Using safer sync options for MSSQL
    const syncOptions = { 
      // Don't use alter: true in MSSQL as it has issues with UNIQUE constraints
      // Instead, just sync the models without trying to alter existing tables
      alter: false
    };

    // If you need to make schema changes, consider using migrations instead
    await User.sync(syncOptions);
    await Thread.sync(syncOptions);
    await ThreadSegment.sync(syncOptions);
    await Reaction.sync(syncOptions);
    await Bookmark.sync(syncOptions);
    await Collection.sync(syncOptions);
    await CollectionItem.sync(syncOptions);
    
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