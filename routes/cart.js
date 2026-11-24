const express = require('express');
const models = require('../models');
const protect = require('../middleware/auth');

const CartItem = models.CartItem || models.Cart;
const { Product } = models;

const router = express.Router();
router.use(protect);

router.get('/', protect, async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ 
        model: Product,
        attributes: ['id', 'name', 'price', 'images'] // Only get needed fields
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (error) {
    console.error('Cart GET error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, size, color, specialInstructions } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const where = { userId: req.user.id, productId };
    if (size) where.size = size;
    if (color) where.color = color;

    let item = await CartItem.findOne({ where });

    if (item) {
      item.quantity = Number(item.quantity) + Number(quantity);
      if (specialInstructions) item.specialInstructions = specialInstructions;
      await item.save();
    } else {
      item = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity: Number(quantity),
        size: size || null,
        color: color || null,
        specialInstructions: specialInstructions || null
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('ADD TO CART ERROR:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    if (req.body.quantity !== undefined) item.quantity = Number(req.body.quantity);
    if (req.body.specialInstructions !== undefined) item.specialInstructions = req.body.specialInstructions;
    if (item.quantity <= 0) { await item.destroy(); return res.json({ success: true, removed: true }); }
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await CartItem.destroy({ where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;