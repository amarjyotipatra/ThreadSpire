import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DATABASE_URL!,
    {
      dialect: 'mssql',
      dialectOptions: {
        encrypt: true, 
        trustServerCertificate: false,
      },
      logging: false, 
    }
  );
  
  // Test the connection
  sequelize.authenticate()
    .then(() => console.log('Connected to Azure SQL Database'))
    .catch((err) => console.error('Connection error:', err));
  
  export { sequelize };