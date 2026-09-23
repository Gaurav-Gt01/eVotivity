const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationalId: {
    type: DataTypes.STRING,
    unique: true
  },
  walletAddress: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM('ROLE_VOTER', 'ROLE_ADMIN'),
    defaultValue: 'ROLE_VOTER'
  },
  faceImagePath: {
    type: DataTypes.TEXT
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  refreshToken: {
    type: DataTypes.TEXT
  }
});

module.exports = User;

