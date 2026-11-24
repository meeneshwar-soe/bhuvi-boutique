const express = require('express');
const { sequelize, Order, OrderItem, CartItem, Product, Coupon } = require('../models');
const protect = require('../middleware/auth');

const router = express.Router();

const formatOrder = (order) => {
  const json = order.toJSON();
  json.shippingAddress = {
    name: json.shippingName, phone: json.shippingPhone, street: json.shippingStreet,
    city: json.shippingCity, state: json.shippingState, zip: json.shippingZip, country: json.shippingCountry
  };
  json.returnRequest = {
    requested: json.returnRequested, type: json.returnType,
    reason: json.returnReason, status: json.returnStatus, createdAt: json.returnCreatedAt
  };
  return json;
};

const validateCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({ where: { code, active: true } });
  if (!coupon) return { valid: false, error: 'Invalid coupon code' };
  if (new Date(coupon.expiresAt) < new Date()) return { valid: false, error: 'Coupon expired' };
  if (coupon.usedCount >= coupon.usageLimit) return { valid: false, error: 'Coupon usage limit reached' };
  if (subtotal < coupon.minOrder) return { valid: false, error: `Minimum order ₹${coupon.minOrder} required` };

  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  discount = Math.min(discount, coupon.maxDiscount, subtotal);
  return { valid: true, coupon, discount: Math.round(discount * 100) / 100 };
};

// ==========================================
// CREATE ORDER (Checkout)
// ==========================================
router.post('/', protect, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { address, couponCode, paymentMethod, shippingFee: frontendShipping } = req.body;
    
    if (!address || !address.name || !address.phone || !address.street || !address.city || !address.state || !address.zip || !address.country) {
      await t.rollback();
      return res.status(400).json({ error: 'Please fill full shipping address' });
    }

    const cartItems = await CartItem.findAll({ where: { userId: req.user.id }, include: [{ model: Product }], transaction: t });
    if (!cartItems.length) { 
      await t.rollback(); 
      return res.status(400).json({ error: 'Cart is empty' }); 
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      if (!item.Product || !item.Product.active) {
        await t.rollback();
        return res.status(400).json({ error: 'One product in cart is unavailable' });
      }
      subtotal += item.Product.price * item.quantity;
      
      orderItems.push({
        productId: item.Product.id, 
        name: item.Product.name,
        image: item.Product.images && item.Product.images[0] ? item.Product.images[0] : '',
        size: item.size || 'Standard',
        color: item.color || 'Standard',
        quantity: item.quantity, 
        price: item.Product.price,
        specialInstructions: item.specialInstructions || null
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    let shippingFee = 0;
    if (frontendShipping !== undefined && frontendShipping !== null) {
      shippingFee = Number(frontendShipping);
    } else {
      shippingFee = subtotal > 1999 ? 0 : 75;
    }

    let discount = 0, finalCode = '';
    if (couponCode) {
      const result = await validateCoupon(couponCode.toUpperCase(), subtotal);
      if (!result.valid) { 
        await t.rollback(); 
        return res.status(400).json({ error: result.error }); 
      }
      discount = result.discount;
      finalCode = result.coupon.code;
    }

    const total = Math.max(0, subtotal - discount + shippingFee);

    const order = await Order.create({
      userId: req.user.id,
      shippingName: address.name, shippingPhone: address.phone, shippingStreet: address.street,
      shippingCity: address.city, shippingState: address.state, shippingZip: address.zip, shippingCountry: address.country,
      paymentMethod: paymentMethod || 'Razorpay', paymentStatus: 'Pending',
      subtotal, discount, couponCode: finalCode, shippingFee, total, status: 'Pending',
      
      selectedSize: cartItems[0]?.size || 'Standard',
      selectedColor: cartItems[0]?.color || 'Standard',
      specialInstructions: cartItems[0]?.specialInstructions || null
      
    }, { transaction: t });

    await OrderItem.bulkCreate(orderItems.map(i => ({ ...i, orderId: order.id })), { transaction: t });
    
    await t.commit();

    const full = await Order.findByPk(order.id, { include: [{ model: OrderItem }] });
    res.status(201).json(formatOrder(full));
  } catch (error) {
    await t.rollback();
    console.error('Order creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// GET MY ORDERS (Customer)
// ==========================================
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id }, 
      include: [{ model: OrderItem }], 
      order: [['createdAt', 'DESC']]
    });
    res.json(orders.map(formatOrder));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// GET SINGLE ORDER (Customer)
// ==========================================
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      where: { id: req.params.id, userId: req.user.id }, 
      include: [{ model: OrderItem }] 
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(formatOrder(order));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ✅ REQUEST RETURN / EXCHANGE (Customer)
// ==========================================
router.post('/:id/return', protect, async (req, res) => {
  try {
    const { reason, type } = req.body;
    if (!reason || !type) return res.status(400).json({ error: 'Reason and type required' });

    // ✅ Case-insensitive normalize → always 'Return' | 'Exchange' | 'Replace'
    const t = String(type).toLowerCase();
    let normalizedType = 'Return';
    if (t === 'exchange') normalizedType = 'Exchange';
    else if (t === 'replace') normalizedType = 'Replace';
    else if (t === 'return') normalizedType = 'Return';

    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'Delivered') return res.status(400).json({ error: 'Only delivered items can be returned/exchanged' });
    if (order.returnRequested) return res.status(400).json({ error: 'Return request already submitted for this order' });

    order.returnRequested = true;
    order.returnType = normalizedType;     // ✅ now guaranteed to save
    order.returnReason = reason.trim();
    order.returnStatus = 'Pending';
    order.returnCreatedAt = new Date();
    await order.save();

    console.log(`🔄 Order #${order.id} return → ${normalizedType} — "${reason}"`);

    const full = await Order.findByPk(order.id, { include: [{ model: OrderItem }] });
    res.json(formatOrder(full));
  } catch (error) {
    console.error('Return request error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;