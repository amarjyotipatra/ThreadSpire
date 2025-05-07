import { Sequelize } from 'sequelize';

// Better build time detection with multiple checks
export const isBuildTime = 
  process.env.NODE_ENV === 'production' || 
  process.env['NEXT_PHASE'] === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build';

const databaseUrl = process.env.DATABASE_URL;

// Initialize a mock database for build time or use the real connection
let sequelize: Sequelize;

// Always use mock database during build to avoid connection errors
if (isBuildTime || !databaseUrl) {
  // Create a mock Sequelize instance for build time
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
} else {
  // Runtime with available database URL
  // Initialize production database connection without dynamic imports
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'mssql',
    dialectOptions: {
      encrypt: true,  // Required for Azure SQL Database
      trustServerCertificate: false,
    },
    logging: false,  // Disable logging for cleaner output
  });

  // Only authenticate at runtime but don't await at the top level
  sequelize.authenticate()
    .then(() => console.log('Connected to Azure SQL Database'))
    .catch((err) => console.error('Connection error:', err.message || err));
}

export { sequelize };