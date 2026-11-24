const express = require('express');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/role');

// ✅ ONLY ONE IMPORT LINE HERE (Includes ShippingZone)
const { sequelize, User, Product, Order, OrderItem, Review, ShippingZone } = require('../models');

// ✅ Email imports (Added the new specific email templates)
const { 
  sendMail, 
  orderStatusEmail, 
  accountSuspendedEmail, 
  accountActivatedEmail,
  outForDeliveryEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  returnAcceptedEmail,
  returnRejectedEmail
} = require('../services/email');

const { updateProductRating } = require('./reviews');

const router = express.Router();
router.use(protect);
router.use(adminOnly);

// Stats
// Stats - Only count paid orders
router.get('/stats', async (req, res) => {
  try {
    const users = await User.count();
    const products = await Product.count();
    
    // ✅ Only count orders with paymentStatus = 'Paid'
    const orders = await Order.count({ where: { paymentStatus: 'Paid' } });
    
    const row = await Order.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('total')), 'revenue']],
      where: { paymentStatus: 'Paid' }, 
      raw: true
    });
    
    res.json({ 
      users, 
      products, 
      orders, // Now shows only paid orders
      revenue: row && row.revenue ? parseFloat(row.revenue) : 0 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users
router.get('/users', async (req, res) => {
  try { res.json(await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] })); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// SUSPEND / ACTIVATE USER
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot suspend admin' });

    user.suspended = Boolean(req.body.suspended);
    await user.save();

    if (user.suspended) {
      await sendMail({ to: user.email, ...accountSuspendedEmail(user.name) });
      console.log('📧 Suspension email sent to:', user.email);
    } else {
      await sendMail({ to: user.email, ...accountActivatedEmail(user.name) });
      console.log('📧 Reactivation email sent to:', user.email);
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Orders - ONLY show paid orders
router.get('/orders', async (req, res) => {
  try {
    res.json(await Order.findAll({
      where: { paymentStatus: 'Paid' },  // ✅ Only show paid orders
      include: [{ model: User, attributes: ['name', 'email'] }, { model: OrderItem }],
      order: [['createdAt', 'DESC']]
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATED: Update order status with specific email notifications
router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: User, attributes: ['name', 'email'] }] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const oldStatus = order.status;
    const newStatus = req.body.status;
    const cancellationReason = req.body.reason || '';

    await order.update(req.body);

    // Send specific emails based on status change
    if (newStatus && newStatus !== oldStatus && order.User) {
      console.log(`📧 Status changed from ${oldStatus} to ${newStatus} for Order #${order.id}`);

      if (newStatus === 'OutForDelivery') {
        sendMail({ to: order.User.email, ...outForDeliveryEmail(order.User.name, order.id) })
          .then(() => console.log(`✅ Out for Delivery email sent to ${order.User.email}`))
          .catch(err => console.error('❌ Failed to send out for delivery email:', err));
      } 
      else if (newStatus === 'Delivered') {
        sendMail({ to: order.User.email, ...orderDeliveredEmail(order.User.name, order.id, order.total) })
          .then(() => console.log(`✅ Delivered email sent to ${order.User.email}`))
          .catch(err => console.error('❌ Failed to send delivered email:', err));
      } 
      else if (newStatus === 'Cancelled') {
        sendMail({ to: order.User.email, ...orderCancelledEmail(order.User.name, order.id, cancellationReason) })
          .then(() => console.log(`✅ Cancelled email sent to ${order.User.email}`))
          .catch(err => console.error('❌ Failed to send cancelled email:', err));
      }
      else {
        // Fallback for any other status changes
        sendMail({ to: order.User.email, ...orderStatusEmail(order.User.name, order.id, newStatus) });
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Returns
router.get('/returns', async (req, res) => {
  try {
    res.json(await Order.findAll({
      where: { returnRequested: true },
      include: [{ model: User, attributes: ['name', 'email'] }, { model: OrderItem }],
      order: [['updatedAt', 'DESC']]
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATED: Returns route with email notifications
router.put('/returns/:id', async (req, res) => {
  try {
    // ✅ IMPORTANT: Added include for User to get the customer's email
    const order = await Order.findByPk(req.params.id, { 
      include: [{ model: User, attributes: ['name', 'email'] }] 
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.returnRequested) return res.status(400).json({ error: 'No return request found' });

    const oldStatus = order.returnStatus;
    if (req.body.returnStatus) order.returnStatus = req.body.returnStatus;
    await order.save();

    // ✅ Send email if status changed
    if (req.body.returnStatus && req.body.returnStatus !== oldStatus && order.User) {
      console.log(`📧 Return status changed from ${oldStatus} to ${req.body.returnStatus} for Order #${order.id}`);

      // ✅ Check for BOTH 'Accepted' and 'Approved'
      if (req.body.returnStatus === 'Accepted' || req.body.returnStatus === 'Approved') {
        sendMail({ 
          to: order.User.email, 
          ...returnAcceptedEmail(order.User.name, order.id, order.returnType, order.returnReason) 
        }).then(() => console.log(`✅ Return Accepted email sent to ${order.User.email}`));
      } 
      else if (req.body.returnStatus === 'Rejected') {
        sendMail({ 
          to: order.User.email, 
          ...returnRejectedEmail(order.User.name, order.id, order.returnType, order.returnReason) 
        }).then(() => console.log(`✅ Return Rejected email sent to ${order.User.email}`));
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reviews
router.get('/reviews', async (req, res) => {
  try {
    res.json(await Review.findAll({
      include: [{ model: User, attributes: ['name'] }, { model: Product, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    const productId = review.productId;
    await review.destroy();
    await updateProductRating(productId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// SHIPPING ZONES (Admin manages delivery areas)
// ==========================================
router.get('/shipping-zones', async (req, res) => {
  try {
    const zones = await ShippingZone.findAll({ order: [['zoneName', 'ASC']] });
    res.json(zones);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/shipping-zones', async (req, res) => {
  try {
    const zone = await ShippingZone.create(req.body);
    res.status(201).json(zone);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/shipping-zones/:id', async (req, res) => {
  try {
    const zone = await ShippingZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    await zone.update(req.body);
    res.json(zone);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.patch('/shipping-zones/:id/toggle', async (req, res) => {
  try {
    const zone = await ShippingZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    zone.isActive = !zone.isActive;
    await zone.save();
    res.json(zone);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/shipping-zones/:id', async (req, res) => {
  try {
    const zone = await ShippingZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    await zone.destroy();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;