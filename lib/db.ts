import { Sequelize } from 'sequelize';

// Better build time detection with multiple checks
export const isBuildTime = 
  process.env.NODE_ENV === 'production' || 
  process.env['NEXT_PHASE'] === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build';

const databaseUrl = process.env.DATABASE_URL;

console.log('Build environment detection:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PHASE: process.env['NEXT_PHASE'],
  npm_lifecycle_event: process.env.npm_lifecycle_event,
  isBuildTime
});
console.log('DATABASE_URL availability:', databaseUrl ? 'Available' : 'Not available');

// Initialize a mock database for build time or use the real connection
let sequelize: Sequelize;

// Always use mock database during build to avoid connection errors
if (isBuildTime || !databaseUrl) {
  console.log('Using mock database for build or missing DATABASE_URL');
  // Create a mock Sequelize instance
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
} else {
  // Runtime with available database URL
  console.log('Initializing production database connection');
  
  // Only try to import tedious at runtime
  let dialectModule: any;
  try {
    // Dynamic import to avoid bundling issues
    dialectModule = await import('tedious');
  } catch (error) {
    console.error('Failed to import tedious:', error);
  }

  sequelize = new Sequelize(databaseUrl, {
    dialect: 'mssql',
    dialectOptions: {
      encrypt: true,  // Required for Azure SQL Database
      trustServerCertificate: false,
    },
    logging: false,  // Disable logging for cleaner output
    dialectModule: dialectModule?.default || dialectModule, // Use dynamic import module
  });

  // Only authenticate at runtime
  sequelize.authenticate()
    .then(() => console.log('Connected to Azure SQL Database'))
    .catch((err) => console.error('Connection error:', err.message || err));
}

export { sequelize };