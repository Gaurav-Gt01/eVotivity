const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VoterRegistration = sequelize.define('VoterRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  electionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  walletAddress: {
    type: DataTypes.STRING
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasVoted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  txHash: {
    type: DataTypes.STRING
  }
});

module.exports = VoterRegistration;
