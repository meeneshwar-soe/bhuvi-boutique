const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { sequelize, Order, OrderItem, Product, CartItem, Coupon } = require('../models');
const protect = require('../middleware/auth');
const { sendMail, orderPlacedEmail } = require('../services/email');

const router = express.Router();

// Safety check: Ensure keys exist before initializing
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('⚠️ WARNING: Razorpay keys are missing in your .env file!');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Safety check before proceeding
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({ error: 'Razorpay Key ID is missing. Please check your .env file and restart the server.' });
    }

    const order = await Order.findOne({ where: { id: orderId, userId: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.paymentStatus === 'Paid') return res.status(400).json({ error: 'Order already paid' });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Amount in paise
      currency: 'INR',
      receipt: `order_${order.id}`
    });

    // ✅ Return the key explicitly so the frontend can use it
    res.json({ 
      key: process.env.RAZORPAY_KEY_ID, 
      orderId: rzpOrder.id, 
      amount: rzpOrder.amount, 
      currency: rzpOrder.currency 
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');

    if (generated !== razorpay_signature) {
      await t.rollback();
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id }, include: [{ model: OrderItem }], transaction: t
    });
    if (!order) { await t.rollback(); return res.status(404).json({ error: 'Order not found' }); }
    if (order.paymentStatus === 'Paid') { await t.rollback(); return res.json({ success: true, orderId: order.id }); }

    // Reduce stock
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) { await t.rollback(); return res.status(400).json({ error: 'Product unavailable' }); }
      if (product.stock < item.quantity) { await t.rollback(); return res.status(400).json({ error: `Not enough stock for ${product.name}` }); }
      await product.decrement('stock', { by: item.quantity, transaction: t });
    }

    // Increase coupon usage
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ where: { code: order.couponCode }, transaction: t });
      if (coupon) await coupon.increment('usedCount', { transaction: t });
    }

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    await order.save({ transaction: t });

    await CartItem.destroy({ where: { userId: req.user.id }, transaction: t });
    await t.commit();

    // Send confirmation email (make sure this doesn't crash if email service is down)
    try {
      sendMail({ to: req.user.email, ...orderPlacedEmail(req.user.name, order.id, order.total) });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
    }

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    await t.rollback();
    console.error('Payment Verification Error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;