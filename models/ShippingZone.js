const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ShippingZone = sequelize.define('ShippingZone', {
  zoneName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zoneType: {
    type: DataTypes.ENUM('city', 'state', 'country', 'pincode'),
    allowNull: false,
    defaultValue: 'city'
  },
  country: { type: DataTypes.STRING, defaultValue: 'India' },
  state: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Single or comma separated: 400001,400002'
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  baseShippingCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  freeShippingAbove: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  estimatedDeliveryDays: { type: DataTypes.STRING, defaultValue: '3-5 business days' },
  maxWeightKg: { type: DataTypes.DECIMAL(6, 2), allowNull: true }
}, {
  tableName: 'shipping_zones',
  timestamps: true
});

module.exports = ShippingZone;