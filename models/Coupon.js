const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const num = (field, def) => ({
  type: DataTypes.DECIMAL(10, 2), defaultValue: def,
  get() { const v = this.getDataValue(field); return v === null ? def : parseFloat(v); }
});

const Coupon = sequelize.define('Coupon', {
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false },
  value: num('value', 0),
  minOrder: num('minOrder', 0),
  maxDiscount: num('maxDiscount', 1000000),
  usageLimit: { type: DataTypes.INTEGER, defaultValue: 1000 },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'coupons' });

module.exports = Coupon;