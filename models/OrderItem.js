const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: DataTypes.STRING,
  image: DataTypes.STRING,
  size: DataTypes.STRING,
  color: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: {
    type: DataTypes.DECIMAL(10, 2), allowNull: false,
    get() { const v = this.getDataValue('price'); return v === null ? 0 : parseFloat(v); }
  },
  specialInstructions: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'order_items' });

module.exports = OrderItem;