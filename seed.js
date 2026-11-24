require('dotenv').config();
const { sequelize, User, Product, Coupon } = require('./models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });

    await User.create({ name: 'Admin', email: 'admin@boutique.com', password: 'admin123', role: 'admin' });
    await User.create({ name: 'Demo Customer', email: 'customer@boutique.com', password: 'customer123', role: 'customer' });

    await Product.create({ name: 'Silk Evening Gown', description: 'Luxurious silk gown for special occasions.', category: 'Dresses', brand: 'Luxe', price: 4999, stock: 15, sizes: 'S,M,L', colors: 'Black,Red,Navy', images: [], featured: true });
    await Product.create({ name: 'Floral Summer Dress', description: 'Lightweight floral dress perfect for summer.', category: 'Dresses', brand: 'Luxe', price: 1499, stock: 30, sizes: 'XS,S,M,L', colors: 'Pink,Yellow', images: [], featured: true });
    await Product.create({ name: 'Embroidered Kurti', description: 'Traditional embroidered kurti with elegant work.', category: 'Kurtis', brand: 'Ethnic Wear', price: 1199, stock: 50, sizes: 'S,M,L,XL', colors: 'White,Green', images: [] });
    await Product.create({ name: 'Casual Cotton Top', description: 'Comfortable everyday cotton top.', category: 'Tops', brand: 'Daily Wear', price: 799, stock: 100, sizes: 'S,M,L', colors: 'White,Blue,Grey', images: [] });

    await Coupon.create({ code: 'WELCOME10', type: 'percent', value: 10, minOrder: 500, maxDiscount: 500, usageLimit: 100, expiresAt: new Date('2027-12-31') });
    await Coupon.create({ code: 'FLAT200', type: 'fixed', value: 200, minOrder: 1000, usageLimit: 50, expiresAt: new Date('2027-12-31') });
    await Coupon.create({ code: 'SAVE25', type: 'percent', value: 25, minOrder: 2000, maxDiscount: 1000, usageLimit: 30, expiresAt: new Date('2027-12-31') });

    console.log('✅ Database seeded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();