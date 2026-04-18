const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const { emitEvent } = require('../services/socketService');

// @desc    Get all available orders for riders (must be 'ready' and unassigned)
// @route   GET /api/rider/available
// @access  Private/Rider
const getAvailableOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        status: 'ready',
        rider: { $exists: false }
    })
    .populate('user', 'firstName lastName email')
    .sort({ priority: 1, createdAt: 1 });

    res.json(orders);
});

// @desc    Get current active orders for the rider
// @route   GET /api/rider/my-orders
// @access  Private/Rider
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        rider: req.user._id,
        status: { $in: ['ready', 'out-for-delivery'] }
    })
    .populate('user', 'firstName lastName email')
    .sort({ updatedAt: -1 });

    res.json(orders);
});

// @desc    Accept an order for delivery
// @route   PATCH /api/rider/accept
// @access  Private/Rider
const acceptOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.rider) {
        res.status(400);
        throw new Error('Order already assigned to a rider');
    }

    if (order.status !== 'ready') {
        res.status(400);
        throw new Error('Order is not ready for pickup yet');
    }

    order.rider = req.user._id;
    order.acceptedAt = Date.now();
    order.status = 'accepted';
    order.statusHistory.push({
        status: 'accepted',
        timestamp: Date.now()
    });

    const updatedOrder = await order.save();

    // Notify ALL relevant parties using the requested event protocol
    emitEvent('kitchen', 'orderUpdate', updatedOrder);
    emitEvent('admin', 'orderUpdate', updatedOrder);
    emitEvent(order.user.toString(), 'orderUpdate', updatedOrder);
    emitEvent('riders', 'order:assigned-to-rider', {
        orderId: updatedOrder._id,
        rider: req.user.firstName + ' ' + (req.user.lastName || ''),
        status: updatedOrder.status
    });

    res.json(updatedOrder);
});

// @desc    Reject an order for delivery
// @route   PATCH /api/rider/reject
// @access  Private/Rider
const rejectOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    
    // In a real system, you might track who rejected it to avoid re-offering
    // For now, we'll just broadcast that it's still available or was rejected
    res.json({ success: true, message: 'Order rejected from your queue' });
});

// @desc    Update delivery status
// @route   PATCH /api/rider/status
// @access  Private/Rider
const updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.rider.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this order');
    }

    const allowedStatuses = ['picked-up', 'out-for-delivery', 'delivered'];
    if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status for rider workflow');
    }

    order.status = status;
    
    if (status === 'picked-up') {
        order.pickedUpAt = Date.now();
    }
    
    if (status === 'out-for-delivery') {
        // Keep for legacy or if there's a separate step
    }
    
    if (status === 'delivered') {
        order.deliveredAt = Date.now();
    }

    order.statusHistory.push({
        status,
        timestamp: Date.now()
    });

    const updatedOrder = await order.save();

    // Notify
    emitEvent('kitchen', 'orderUpdate', updatedOrder);
    emitEvent('admin', 'orderUpdate', updatedOrder);
    emitEvent(order.user.toString(), 'orderUpdate', updatedOrder);
    emitEvent('riders', 'orderUpdate', updatedOrder);

    res.json(updatedOrder);
});

// @desc    Update rider current location
// @route   PATCH /api/rider/location
// @access  Private/Rider
const updateLocation = asyncHandler(async (req, res) => {
    const { orderId, lat, lng } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.rider.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized for this order');
    }

    order.riderLocation = {
        lat,
        lng,
        updatedAt: Date.now()
    };

    await order.save();

    // Emit live location update to the specific customer and admin
    const locationPayload = {
        orderId: order._id,
        lat,
        lng,
        riderName: req.user.firstName,
        timestamp: Date.now()
    };

    emitEvent(order.user.toString(), 'rider:location-update', locationPayload);
    emitEvent('admin', 'rider:location-update', locationPayload);

    res.json({ success: true, lat, lng });
});

// @desc    Get rider performance stats
// @route   GET /api/rider/stats
// @access  Private/Rider
const getRiderStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await Order.countDocuments({
        rider: req.user._id,
        status: 'delivered',
        deliveredAt: { $gte: today }
    });

    const activeOrders = await Order.countDocuments({
        rider: req.user._id,
        status: { $in: ['ready', 'out-for-delivery'] }
    });

    const totalDeliveries = await Order.countDocuments({
        rider: req.user._id,
        status: 'delivered'
    });

    res.json({
        completedToday,
        activeOrders,
        totalDeliveries
    });
});

module.exports = {
    getAvailableOrders,
    getMyOrders,
    acceptOrder,
    rejectOrder,
    updateDeliveryStatus,
    updateLocation,
    getRiderStats
};
