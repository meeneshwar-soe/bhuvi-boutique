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

// PROTECTED: Submit a review (only if user purchased the product)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user has purchased this product
    const purchase = await Order.findOne({
      where: { userId, paymentStatus: 'Paid' }, // Only paid orders count
      include: [{
        model: OrderItem,
        where: { productId },
        required: true
      }]
    });

    if (!purchase) {
      return res.status(403).json({ 
        error: 'You can only review products you have purchased.' 
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId, productId }
    });

    if (existingReview) {
      return res.status(400).json({ 
        error: 'You have already reviewed this product.' 
      });
    }

    // Create the review
    const review = await Review.create({
      userId,
      productId,
      rating: Number(rating),
      comment,
      approved: true // Auto-approve, or set to false for admin moderation
    });

    // Update product rating
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
    // Check if user is admin
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