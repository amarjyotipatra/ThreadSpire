// filepath: c:\Users\amarj\coding\threadspire\lib\init-db.ts
import { syncDatabase } from '../models';
import { isBuildTime } from './db'; // Import isBuildTime

/**
 * Initialize the database by syncing all models
 * This function should be called when the application starts
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    // Only run syncDatabase if not in build time
    if (!isBuildTime) {
      await syncDatabase();
      console.log('Database initialization complete');
    } else {
      console.log('Skipping database initialization during build time');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Call the initialization function immediately
initializeDatabase();