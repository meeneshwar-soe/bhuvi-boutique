const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CartItem = sequelize.define('CartItem', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  size: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  specialInstructions: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'cart_items',
  indexes: [{ unique: true, fields: ['userId', 'productId', 'size', 'color'] }]
});

module.exports = CartItem;