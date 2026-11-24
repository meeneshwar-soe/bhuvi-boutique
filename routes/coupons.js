const express = require('express');
const { Coupon } = require('../models');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

const router = express.Router();

// Customer: validate coupon
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || subtotal === undefined) return res.status(400).json({ valid: false, error: 'Coupon and subtotal required' });

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase(), active: true } });
    if (!coupon) return res.json({ valid: false, error: 'Invalid coupon code' });
    if (new Date(coupon.expiresAt) < new Date()) return res.json({ valid: false, error: 'Coupon expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.json({ valid: false, error: 'Coupon usage limit reached' });
    if (Number(subtotal) < coupon.minOrder) return res.json({ valid: false, error: `Minimum order ₹${coupon.minOrder} required` });

    let discount = coupon.type === 'percent' ? (Number(subtotal) * coupon.value) / 100 : coupon.value;
    discount = Math.min(discount, coupon.maxDiscount, Number(subtotal));

    res.json({ valid: true, coupon, discount: Math.round(discount * 100) / 100 });
  } catch (error) {
    res.status(400).json({ valid: false, error: error.message });
  }
});

// Admin: create coupon
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, type, value, minOrder, maxDiscount, usageLimit, expiresAt } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(), type,
      value: Number(value),
      minOrder: Number(minOrder || 0),
      maxDiscount: Number(maxDiscount || 1000000),
      usageLimit: Number(usageLimit || 1000),
      expiresAt: new Date(expiresAt)
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: list coupons
router.get('/', protect, adminOnly, async (req, res) => {
  try { res.json(await Coupon.findAll({ order: [['createdAt', 'DESC']] })); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// Admin: delete coupon
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;