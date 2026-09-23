const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  electionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  candidateIdOnChain: {
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  party: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbolUrl: {
    type: DataTypes.TEXT
  },
  bio: {
    type: DataTypes.TEXT
  },
  voteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Candidate;

