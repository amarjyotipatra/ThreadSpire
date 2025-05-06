import { Sequelize } from 'sequelize';

export const isBuildTime = process.env['NEXT_PHASE'] === 'phase-production-build';
const databaseUrl = process.env.DATABASE_URL;

console.log('Build-time check:', isBuildTime);
console.log('DATABASE_URL:', databaseUrl);

if (!databaseUrl) {
    const errorMessage = 'DATABASE_URL is not defined. It is required for Sequelize initialization.';
    if (isBuildTime) {
        // If models are defined using this sequelize instance, DATABASE_URL is needed even at build time.
        // Depending on project setup, you might allow builds without it (e.g., for frontend-only parts or if models are lazy-loaded).
        // Throwing an error here makes the requirement explicit.
        console.error(`Error during build: ${errorMessage}`);
        throw new Error(`Build Error: ${errorMessage}`);
    } else {
        // At runtime, DATABASE_URL is critical.
        throw new Error(errorMessage);
    }
}

// Initialize sequelize with dynamic import instead of require
let dialectModule: any;
// Only try to import tedious if not at build time
if (!isBuildTime) {
  try {
    // Dynamic import to avoid bundling issues
    dialectModule = await import('tedious');
  } catch (error) {
    console.error('Failed to import tedious:', error);
    // Sequelize will attempt to require('tedious') if dialectModule is not provided or resolution fails.
  }
}

const sequelize = new Sequelize(
  databaseUrl, // Use the validated databaseUrl
  {
    dialect: 'mssql',
    dialectOptions: {
      encrypt: true,  // Required for Azure SQL Database
      trustServerCertificate: false,
    },
    logging: false,  // Disable logging for cleaner output
    dialectModule: dialectModule?.default || dialectModule, // Use dynamic import module
  }
);

// Only authenticate if not in build phase and databaseUrl was valid
if (!isBuildTime) {
  sequelize.authenticate()
    .then(() => console.log('Connected to Azure SQL Database'))
    .catch((err) => console.error('Connection error:', err.message || err));
}

export { sequelize };