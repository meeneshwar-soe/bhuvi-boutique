const express = require('express');
const models = require('../models');
const protect = require('../middleware/auth');

const WishlistItem = models.WishlistItem || models.Wishlist;
const { Product } = models;

const router = express.Router();
router.use(protect);

// GET: list wishlist
router.get('/', async (req, res) => {
  try {
    const items = await WishlistItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: toggle (add if not present, remove if present)
router.post('/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await WishlistItem.findOne({ where: { userId: req.user.id, productId } });
    if (existing) {
      await existing.destroy();
      return res.json({ added: false });
    }
    await WishlistItem.create({ userId: req.user.id, productId });
    res.status(201).json({ added: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: remove one
router.delete('/:id', async (req, res) => {
  try {
    const item = await WishlistItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;