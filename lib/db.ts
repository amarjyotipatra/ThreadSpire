import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Create a data directory for SQLite if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite database path for local development
const sqlitePath = path.join(dataDir, 'threadspire.sqlite');

// Better build time detection with multiple checks
export const isBuildTime = 
  process.env.NODE_ENV === 'production' || 
  process.env['NEXT_PHASE'] === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build';

const databaseUrl = process.env.DATABASE_URL;

// Initialize database connection
let sequelize: Sequelize;

console.log('Database initialization starting');

// Always use SQLite for development to ensure it works
if (process.env.NODE_ENV !== 'production' || isBuildTime || !databaseUrl) {
  console.log('Using SQLite database for development/build');
  
  // Create a SQLite database for development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isBuildTime ? ':memory:' : sqlitePath,
    logging: false
  });
} else {
  // Production environment with database URL
  try {
    console.log('Attempting to connect to production database');
    
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'mssql',
      dialectOptions: {
        encrypt: true,
        trustServerCertificate: false,
        options: {
          requestTimeout: 5000,
          connectTimeout: 5000
        }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000
      }
    });
  } catch (err) {
    console.error('Failed to initialize production database, falling back to SQLite:', err);
    
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: sqlitePath,
      logging: false
    });
  }
}

// Initialize database tables on startup
// Don't await this to avoid blocking the app startup
sequelize.sync({ alter: process.env.NODE_ENV !== 'production' })
  .then(() => {
    console.log('Database tables synchronized successfully');
  })
  .catch((err) => {
    console.error('Failed to sync database tables:', err);
  });

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
  });

export { sequelize };