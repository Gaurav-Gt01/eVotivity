const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Election = sequelize.define('Election', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  contractAddress: {
    type: DataTypes.STRING
  },
  phase: {
    type: DataTypes.ENUM('REGISTRATION', 'VOTING', 'COMPLETED'),
    defaultValue: 'REGISTRATION'
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  totalVotesCast: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Election;
