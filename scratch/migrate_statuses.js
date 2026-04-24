const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const Order = require('../server/models/Order');

const migrateStatuses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for status migration...');

        const statusMap = {
            'placed': 'PENDING',
            'preparing': 'PREPARING',
            'ready': 'READY_FOR_DELIVERY',
            'picked-up': 'PICKED_UP',
            'out-for-delivery': 'PICKED_UP', // Or ARRIVED depending on context, picking PICKED_UP for safety
            'delivered': 'DELIVERED',
            'cancelled': 'CANCELLED',
            'CONFIRMED': 'PREPARING',
            'PLACED': 'PENDING',
            'READY': 'READY_FOR_DELIVERY',
            'DISPATCHED': 'READY_FOR_DELIVERY'
        };

        const orders = await Order.find({});
        console.log(`Found ${orders.length} orders. Syncing statuses...`);

        let updatedCount = 0;
        for (const order of orders) {
            if (statusMap[order.status]) {
                const oldStatus = order.status;
                order.status = statusMap[order.status];
                
                // Also update history
                order.statusHistory = order.statusHistory.map(h => ({
                    ...h,
                    status: statusMap[h.status] || h.status
                }));

                await order.save();
                console.log(`Updated Order ${order.orderNumber || order._id}: ${oldStatus} -> ${order.status}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. ${updatedCount} orders updated.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateStatuses();
