import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';  // adjust path if needed

dotenv.config({ path: '../.env' });  // adjust if your .env is elsewhere

const users = [
  {
    name: 'Admin',
    email: 'admin@dinexis.com',
    password: 'admin123',
    role: 'admin',
    phone: '1234567890'      // if required
  },
  {
    name: 'Rider',
    email: 'rider@dinexis.com',
    password: 'rider123',
    role: 'rider',
    phone: '0987654321'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();