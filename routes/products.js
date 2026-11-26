const express = require('express');
const { Op } = require('sequelize');
const { Product, Review } = require('../models'); // ✅ Review model MUST be imported here
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: upload a single file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'boutique/products', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Helper: Parse images from JSON string to Array
const formatProduct = (product) => {
  if (product) {
    const data = product.toJSON ? product.toJSON() : product;
    if (typeof data.images === 'string') {
      try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
    } else if (!data.images) {
      data.images = [];
    }
    return data;
  }
  return product;
};

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get('/', async (req, res) => {
  try {
    const { q, category, min, max, sort, page = 1, limit = 12 } = req.query;
    const where = { active: true };

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { category: { [Op.like]: `%${q}%` } }
      ];
    }
    if (category) where.category = category;
    if (min || max) {
      where.price = {};
      if (min) where.price[Op.gte] = Number(min);
      if (max) where.price[Op.lte] = Number(max);
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];

    const currentPage = Number(page);
    const pageSize = Number(limit);

    const { count, rows } = await Product.findAndCountAll({
      where, order, limit: pageSize, offset: (currentPage - 1) * pageSize
    });

    // ✅ CALCULATE RATINGS FOR EVERY PRODUCT
    const productsWithRatings = await Promise.all(rows.map(async (product) => {
      const data = formatProduct(product);
      
      // Fetch all reviews for this specific product
      const reviews = await Review.findAll({ 
        where: { productId: data.id },
        attributes: ['rating']
      });
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        data.averageRating = (totalRating / reviews.length).toFixed(1);
        data.reviewCount = reviews.length;
      } else {
        data.averageRating = 0;
        data.reviewCount = 0;
      }
      
      return data;
    }));

    res.json({ 
      products: productsWithRatings, 
      total: count, 
      page: currentPage, 
      pages: Math.ceil(count / pageSize) 
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const rows = await Product.findAll({
      attributes: ['category'], where: { active: true }, group: ['category'], raw: true
    });
    res.json(rows.map(r => r.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const data = formatProduct(product);
    
    // ✅ Calculate rating for single product view
    const reviews = await Review.findAll({ where: { productId: data.id }, attributes: ['rating'] });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      data.averageRating = (totalRating / reviews.length).toFixed(1);
      data.reviewCount = reviews.length;
    } else {
      data.averageRating = 0;
      data.reviewCount = 0;
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

router.post('/', protect, adminOnly, upload.any(), async (req, res) => {
  try {
    const { name, description, category, price, stock, deliveryInfo, returnPolicy } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        images.push(url);
      }
    }

    const product = await Product.create({
      name, 
      description, 
      category,
      price: Number(price), 
      stock: Number(stock),
      deliveryInfo: deliveryInfo ? deliveryInfo.trim() : null,
      returnPolicy: returnPolicy === 'true' || returnPolicy === true || returnPolicy === 'on',
      images: JSON.stringify(images),
      active: true
    });
    
    res.status(201).json(formatProduct(product));
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', protect, adminOnly, upload.any(), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const updateData = {};
    
    ['name', 'description', 'category', 'price', 'stock', 'deliveryInfo', 'returnPolicy', 'active']
      .forEach(f => { 
        if (req.body[f] !== undefined) {
          if (f === 'returnPolicy') {
            updateData[f] = req.body[f] === 'true' || req.body[f] === true || req.body[f] === 'on';
          } else if (f === 'price' || f === 'stock') {
            updateData[f] = Number(req.body[f]);
          } else if (f === 'deliveryInfo') {
            updateData[f] = req.body[f] ? req.body[f].trim() : null;
          } else {
            updateData[f] = req.body[f];
          }
        } 
      });
    
    if (req.files && req.files.length > 0) {
      let newImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        newImages.push(url);
      }
      updateData.images = JSON.stringify(newImages);
    }

    await product.update(updateData);
    res.json(formatProduct(product));
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update({ active: false });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;