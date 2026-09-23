const { Sequelize } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

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
  // Persistent SQLite file storage for durable data persistence across server restarts
  const dbPath = path.join(__dirname, '../evotivity.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('🐬 Database connected successfully (MySQL/SQLite Persistent File).');
    await sequelize.sync({ alter: true });
    console.log('✅ All Database Tables Synchronized.');

    // Seed default Admin user if not exists
    const User = require('../models/User');
    const defaultAdmin = await User.findOne({ where: { email: 'gauravtatpate@gmail.com' } });
    if (!defaultAdmin) {
      const hashedPassword = await bcrypt.hash('gauravtatpate01', 10);
      await User.create({
        fullName: 'Gaurav Tatpate',
        username: 'gauravtatpate',
        email: 'gauravtatpate@gmail.com',
        password: hashedPassword,
        nationalId: 'ADMIN-001',
        role: 'ROLE_ADMIN',
        isApproved: true
      });
      console.log('👑 Default Admin Account seeded successfully (gauravtatpate@gmail.com).');
    }
  } catch (error) {
    console.error('⚠️ Database connection error:', error.message);
  }
};

module.exports = { sequelize, connectDB };

