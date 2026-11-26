const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const num = (field) => ({
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
  get() {
    const v = this.getDataValue(field);
    return v === null ? 0 : parseFloat(v);
  }
});

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  // Shipping Details
  shippingName: DataTypes.STRING,
  shippingPhone: DataTypes.STRING,
  shippingStreet: DataTypes.STRING,
  shippingCity: DataTypes.STRING,
  shippingState: DataTypes.STRING,
  shippingZip: DataTypes.STRING,
  shippingCountry: DataTypes.STRING,

  // Payment Details
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'Razorpay' },
  paymentStatus: { type: DataTypes.ENUM('Pending', 'Paid', 'Failed', 'Refunded'), defaultValue: 'Pending' },
  razorpayOrderId: DataTypes.STRING,
  razorpayPaymentId: DataTypes.STRING,
  razorpaySignature: DataTypes.TEXT,

  // Pricing Details
  subtotal: num('subtotal'),
  discount: num('discount'),
  couponCode: DataTypes.STRING,
  shippingFee: num('shippingFee'),
  total: num('total'),

  // Order Status & Tracking
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Returned', 'Replaced'),
    defaultValue: 'Pending'
  },
  trackingNumber: DataTypes.STRING,

  // Customer Product Selections & Notes
  selectedSize: { type: DataTypes.STRING, allowNull: true },
  selectedColor: { type: DataTypes.STRING, allowNull: true },
  specialInstructions: { type: DataTypes.TEXT, allowNull: true },

  // Return/Replacement Details
  returnRequested: { type: DataTypes.BOOLEAN, defaultValue: false },
  returnType: { type: DataTypes.STRING(20), allowNull: true },
  returnReason: { type: DataTypes.TEXT, allowNull: true },
  returnStatus: { type: DataTypes.STRING(20), defaultValue: 'Pending' },
  returnCreatedAt: { type: DataTypes.DATE, allowNull: true }

}, {
  tableName: 'orders',
  freezeTableName: true
});

module.exports = Order;