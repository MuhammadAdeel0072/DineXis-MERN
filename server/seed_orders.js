require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

const createMockOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a customer to assign orders to
        const customer = await User.findOne({ role: 'customer' }) || await User.findOne();
        if (!customer) {
            console.error('No users found to assign orders to');
            process.exit(1);
        }

        const orders = [
            {
                user: customer._id,
                orderItems: [{ name: 'Spicy Burger', qty: 1, price: 550, image: 'burger.jpg', product: new mongoose.Types.ObjectId() }],
                shippingAddress: {
                    fullName: 'Ali Ahmed',
                    phoneNumber: '03001234567',
                    address: 'Street 5, F-7/2, Islamabad',
                    area: 'F-7',
                    city: 'Islamabad',
                    lat: 33.7215,
                    lng: 73.0561
                },
                paymentMethod: 'cod',
                totalPrice: 600,
                status: 'READY_FOR_DELIVERY',
                orderNumber: `ORD-${Date.now()}-1`
            },
            {
                user: customer._id,
                orderItems: [{ name: 'Club Sandwich', qty: 2, price: 450, image: 'sandwich.jpg', product: new mongoose.Types.ObjectId() }],
                shippingAddress: {
                    fullName: 'Sara Khan',
                    phoneNumber: '03217654321',
                    address: 'House 12, F-6/1, Islamabad',
                    area: 'F-6',
                    city: 'Islamabad',
                    lat: 33.7297,
                    lng: 73.0746
                },
                paymentMethod: 'cod',
                totalPrice: 1000,
                status: 'READY_FOR_DELIVERY',
                orderNumber: `ORD-${Date.now()}-2`
            }
        ];

        await Order.insertMany(orders);
        console.log('Mock orders created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create orders:', error);
        process.exit(1);
    }
};

createMockOrders();
