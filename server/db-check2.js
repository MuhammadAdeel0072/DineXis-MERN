const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const orders = await Order.find({}, 'status');
    const s = {};
    orders.forEach(i => s[i.status] = (s[i.status] || 0) + 1);
    console.log(s);
    process.exit(0);
});
