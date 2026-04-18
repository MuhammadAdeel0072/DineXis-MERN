const mongoose = require('mongoose');
const Order = require('./server/models/Order');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    const orders = await Order.find({}, 'status priority');
    console.log(`Total orders: ${orders.length}`);
    const statusCounts = {};
    orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    console.log("Status breakdown:");
    console.log(statusCounts);
    
    // Test the exact chef query
    const chefOrders = await Order.find({
        status: { $in: ['confirmed', 'preparing', 'placed', 'ready', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY'] }
    });
    console.log(`Chef API query returns: ${chefOrders.length} orders`);
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
