const express = require('express');
const { Review, Product, Order, OrderItem, User } = require('../models');
const protect = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// PUBLIC: Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.findAll({
      where: { productId, approved: true }, // Only show approved reviews
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC: Get all approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { approved: true },
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROTECTED: Submit a review — ONE counted review PER ORDER
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body;
    const userId = req.user.id;
    let targetOrderId = (orderId != null && orderId !== '') ? Number(orderId) : null;

    // All paid orders of this user that contain this product (oldest first)
    const paidOrdersWithProduct = await Order.findAll({
      where: { userId, paymentStatus: 'Paid' },
      include: [{ model: OrderItem, where: { productId }, required: true }],
      order: [['createdAt', 'ASC']]
    });
    if (!paidOrdersWithProduct.length) {
      return res.status(403).json({ error: 'You can only review products you have purchased.' });
    }

    // If an order id was sent, it must be one of the user's real paid orders for this product
    if (targetOrderId != null && !paidOrdersWithProduct.some(o => o.id === targetOrderId)) {
      return res.status(403).json({ error: 'You can only review products from your own paid orders.' });
    }

    // ✅ AUTO-ASSIGN: if no usable order id arrived, attach the review to the
    //    oldest paid order for this product that has no review yet.
    if (targetOrderId == null) {
      for (const o of paidOrdersWithProduct) {
        const already = await Review.findOne({ where: { userId, productId, orderId: o.id } });
        if (!already) { targetOrderId = o.id; break; }
      }
    }
    if (targetOrderId == null) {
      return res.status(400).json({ error: 'You have already reviewed this product for all of your orders.' });
    }

    // ✅ Duplicate check is strictly PER ORDER
    const existingReview = await Review.findOne({ where: { userId, productId, orderId: targetOrderId } });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product for this order.' });
    }

    const review = await Review.create({
      userId,
      productId,
      orderId: targetOrderId,
      rating: Number(rating),
      comment,
      approved: true
    });

    // Counts ALL approved reviews (so 3 orders = 3 counted reviews)
    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to update product average rating
async function updateProductRating(productId) {
  const reviews = await Review.findAll({
    where: { productId, approved: true }
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await Product.update(
    { rating: parseFloat(avgRating.toFixed(1)) },
    { where: { id: productId } }
  );
}

// Admin: Get all reviews (for moderation)
router.get('/admin/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Product, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve/Reject review
router.patch('/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.approved = req.body.approved !== false; // Default to true
    await review.save();

    await updateProductRating(review.productId);

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
module.exports.updateProductRating = updateProductRating;