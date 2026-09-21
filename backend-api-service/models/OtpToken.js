const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OtpToken = sequelize.define('OtpToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  electionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = OtpToken;
