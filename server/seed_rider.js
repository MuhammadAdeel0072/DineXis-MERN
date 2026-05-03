require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedRider = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'rider@dinexis.com';
        const password = 'password123';

        const exists = await User.findOne({ email });
        if (exists) {
            console.log('Rider already exists');
            process.exit(0);
        }

        await User.create({
            firstName: 'Demo',
            lastName: 'Rider',
            email,
            password,
            role: 'rider',
            status: 'online',
            location: {
                lat: 33.6844,
                lng: 73.0479,
                updatedAt: new Date()
            }
        });

        console.log('Rider seeded successfully!');
        console.log('Email: rider@dinexis.com');
        console.log('Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedRider();
