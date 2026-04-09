const Order = require('../models/Order');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/Loyalty');
const { generateReceipt } = require('../services/pdfService');
const { emitEvent } = require('../services/socketService');
const asyncHandler = require('express-async-handler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  // 📝 Structured Diagnostic Log
  console.log('--- Incoming Order Protocol ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Payload:', JSON.stringify(req.body, null, 2));

  // 🛡️ Pre-emptive Destructuring with Defaults
  const {
    orderItems = [],
    shippingAddress = {},
    paymentMethod = 'cod',
    itemsPrice = 0,
    taxPrice = 0,
    shippingPrice = 0,
    totalPrice = 0,
    paymentReference = ''
  } = req.body;

  // 🧹 Data Normalization (Mongoose Numeric Cast Protection)
  const normalizedTotalPrice = Number(totalPrice);
  const normalizedItemsPrice = Number(itemsPrice);
  const normalizedTaxPrice = Number(taxPrice);
  const normalizedShippingPrice = Number(shippingPrice);

  // 🛡️ Data Integrity Check (Phase 2 - Ultra Defensive)
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('Mission Aborted: No order items detected in payload');
  }

  // Validate each item for required product ID and name
  const isItemsValid = orderItems.every(item => item.product && item.name && item.qty > 0);
  if (!isItemsValid) {
    res.status(400);
    throw new Error('Data Corruption: One or more order items are missing critical identifiers (Product ID/Name)');
  }

  if (!shippingAddress.phoneNumber || !shippingAddress.address) {
    res.status(400);
    throw new Error('Identity Verification Failed: Phone and Address are required protocol');
  }

  if (!req.user) {
    res.status(401);
    throw new Error('Security Breach: Authentication required for order placement');
  }

  try {
    const orderNumber = `AK7-${Math.floor(100000 + Math.random() * 899999)}`;

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress: {
        fullName: shippingAddress.fullName || (req.user.firstName + ' ' + (req.user.lastName || '')).trim(),
        phoneNumber: shippingAddress.phoneNumber,
        address: shippingAddress.address,
        streetAddress: shippingAddress.streetAddress || shippingAddress.address,
        city: shippingAddress.city || 'isb',
        area: shippingAddress.area || 'isb',
        postalCode: shippingAddress.postalCode || '44000',
        landmark: shippingAddress.landmark || '',
      },
      paymentMethod,
      itemsPrice: normalizedItemsPrice,
      taxPrice: normalizedTaxPrice,
      shippingPrice: normalizedShippingPrice,
      totalPrice: normalizedTotalPrice,
      paymentReference,
      isPaid: req.body.isPaid || false,
      paidAt: (req.body.isPaid || paymentMethod !== 'cod' && req.body.isPaid) ? Date.now() : null,
      orderNumber,
      status: 'placed',
      statusHistory: [{ status: 'placed', timestamp: Date.now() }]
    });

    const createdOrder = await order.save();

    // 📡 Immediate Response - Send before loyalty syncing to prevent timeouts
    res.status(201).json(createdOrder);

    // --- Loyalty Sync & Real-time Sockets (Background Phase) ---
    // This allows the client to receive confirmation instantly while we finish bookkeeping
    try {
      const pointsEarned = Math.floor(normalizedTotalPrice * 10);
      
      // req.user is now a full Mongoose Document from authMiddleware
      req.user.loyaltyPoints += pointsEarned;
      
      if (req.user.loyaltyPoints >= 5000) req.user.loyaltyTier = 'Platinum';
      else if (req.user.loyaltyPoints >= 2500) req.user.loyaltyTier = 'Gold';
      else if (req.user.loyaltyPoints >= 1000) req.user.loyaltyTier = 'Silver';
      
      await req.user.save();

      await LoyaltyTransaction.create({
        user: req.user._id,
        type: 'earned',
        points: pointsEarned,
        description: `Earned from mission ${orderNumber}`,
        order: createdOrder._id
      });

      // 📡 Real-time Synchronization
      emitEvent('kitchen', 'incomingOrder', createdOrder);
      emitEvent(null, 'adminAction', { type: 'incomingOrder', order: createdOrder });
    } catch (loyaltyError) {
      console.warn('Loyalty Sync Protocol Jammed (Non-critical):', loyaltyError.message);
    }
  } catch (error) {
    console.error('System Exception [Order Save]:', error);
    res.status(500).json({ 
      message: error.name === 'ValidationError' ? 'Database Validation Breach' : 'Internal System Exception',
      details: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message) : error.message
    });
  }
});

// @desc    Get order receipt PDF
// @route   GET /api/orders/:id/receipt
// @access  Private
const getOrderReceipt = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email').lean();

  if (order) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderNumber}.pdf`);
    generateReceipt(order, res);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email').lean();

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentReference = req.body.id || order.paymentReference;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    order.statusHistory.push({ status });

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'cod') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();

    // Emit real-time status update to user and admin
    emitEvent(order.user.toString(), 'orderUpdate', {
      orderId: order._id,
      status: order.status,
      orderNumber: order.orderNumber
    });
    emitEvent(null, 'adminAction', { type: 'orderUpdate', orderId: order._id, status: order.status });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  console.log('Order Route Hit (MyOrders)');
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  console.log('Order Route Hit (Admin Orders)');
  const orders = await Order.find({}).populate('user', 'firstName lastName').sort({ createdAt: -1 }).lean();
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getOrderReceipt
};
