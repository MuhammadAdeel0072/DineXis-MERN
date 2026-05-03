const Order = require('../models/Order');
const { emitEvent } = require('./socketService');

/**
 * Calculate dynamic ETA for an order
 * Formula: ETA = prep_time + queue_delay + rider_travel_time
 */
const calculateETA = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('orderItems.product');
        if (!order) return null;

        // 1. Preparation Time (average from products or specific estimate)
        // items with variants might have different prep times
        let maxPrepTime = 20; // fallback
        if (order.orderItems && order.orderItems.length > 0) {
            maxPrepTime = Math.max(...order.orderItems.map(item => item.prepTime || 20));
        }
        
        // 2. Queue Delay (based on active PREPARING orders)
        const activeOrdersCount = await Order.countDocuments({
            status: { $in: ['PENDING', 'RECEIVED', 'PREPARING'] },
            _id: { $ne: orderId }
        });
        const avgPrepTime = 10; // Average prep time constant for other orders
        const queueDelay = activeOrdersCount * avgPrepTime;

        // 3. Rider Travel Time (default or based on distance if available)
        let travelTime = 15; // default 15 mins
        if (order.estimatedDistance) {
            // Assume 3 mins per km + 5 mins buffer
            travelTime = Math.ceil(order.estimatedDistance * 3) + 5;
        }

        const totalETAInMinutes = maxPrepTime + queueDelay + travelTime;
        
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + totalETAInMinutes);

        // Update order
        order.estimatedDeliveryTime = estimatedDeliveryTime;
        order.etaMinutes = totalETAInMinutes;
        await order.save();

        // Emit update via socket
        emitEvent(order.user.toString(), 'etaUpdated', {
            orderId: order._id,
            estimatedDeliveryTime,
            etaMinutes: totalETAInMinutes
        });

        return totalETAInMinutes;
    } catch (error) {
        console.error('Error calculating ETA:', error);
        return null;
    }
};

module.exports = { calculateETA };
