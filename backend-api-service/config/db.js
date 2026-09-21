const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.MYSQL_HOST) {
  sequelize = new Sequelize(
    process.env.MYSQL_DB || 'evotivity_db',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
      host: process.env.MYSQL_HOST || 'localhost',
      dialect: 'mysql',
      logging: false
    }
  );
} else {
  // SQLite in-memory fallback for instant setup without requiring running MySQL daemon
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('🐬 Database connected successfully (MySQL/SQLite).');
    await sequelize.sync({ alter: true });
    console.log('✅ All Database Tables Synchronized.');
  } catch (error) {
    console.warn('⚠️ Database connection warning, initializing SQLite fallback:', error.message);
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    await sequelize.sync({ alter: true });
  }
};

module.exports = { sequelize, connectDB };
