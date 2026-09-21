const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VoteRecord = sequelize.define('VoteRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  electionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  blockNumber: {
    type: DataTypes.INTEGER
  }
});

module.exports = VoteRecord;
