// filepath: c:\Users\amarj\coding\threadspire\lib\init-db.ts
import { syncDatabase } from '../models';

/**
 * Initialize the database by syncing all models
 * This function should be called when the application starts
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await syncDatabase();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Call the initialization function immediately
initializeDatabase();