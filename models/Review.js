const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // ✅ Ties a review to the specific order it was written for
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  timestamps: true
});

module.exports = Review;