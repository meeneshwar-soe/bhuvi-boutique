const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING },
  price: {
    type: DataTypes.DECIMAL(10, 2), allowNull: false,
    get() { const v = this.getDataValue('price'); return v === null ? 0 : parseFloat(v); }
  },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  sizes: {
    type: DataTypes.TEXT,
    get() { const v = this.getDataValue('sizes'); return v ? v.split(',') : []; },
    set(v) { this.setDataValue('sizes', !v ? '' : Array.isArray(v) ? v.join(',') : String(v)); }
  },
  colors: {
    type: DataTypes.TEXT,
    get() { const v = this.getDataValue('colors'); return v ? v.split(',') : []; },
    set(v) { this.setDataValue('colors', !v ? '' : Array.isArray(v) ? v.join(',') : String(v)); }
  },
  deliveryInfo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Fast & Secure Delivery'
  },
  returnPolicy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  
  // ✅ FIXED IMAGES FIELD
  images: {
    type: DataTypes.TEXT, // Changed from JSON to TEXT for better MySQL compatibility
    allowNull: true,
    defaultValue: '[]',
    get() {
      const v = this.getDataValue('images');
      if (!v) return [];
      if (Array.isArray(v)) return v;
      try { return JSON.parse(v); } catch { return []; }
    }
    // Removed the buggy set() function that was deleting your images!
  },

  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  avgRating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
  totalRatings: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'products' });

module.exports = Product;