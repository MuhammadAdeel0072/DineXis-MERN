const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Drop legacy Clerk index if it exists
    try {
      await User.collection.dropIndex('clerkId_1');
      console.log('Legacy Index Protocol: clerkId_1 dropped successfully');
    } catch (indexError) {
      console.log('Index Check: No legacy clerkId_1 index found or already removed');
    }

    const users = [
      {
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@dinexis.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        firstName: 'Head',
        lastName: 'Chef',
        email: 'chef@dinexis.com',
        password: 'chef123',
        role: 'chef'
      },
      {
        firstName: 'Quick',
        lastName: 'Rider',
        email: 'rider@dinexis.com',
        password: 'rider123',
        role: 'rider'
      }
    ];

    for (const u of users) {
      const userExists = await User.findOne({ email: u.email });
      if (userExists) {
        console.log(`User ${u.email} already exists. Updating role to ${u.role}...`);
        userExists.role = u.role;
        userExists.password = u.password; // This will trigger the pre-save hook and re-hash
        await userExists.save();
      } else {
        await User.create(u);
        console.log(`User ${u.email} (${u.role}) created successfully.`);
      }
    }

    console.log('--- SEEDING COMPLETE ---');
    console.log('Admin login: admin@dinexis.com / admin123');
    console.log('Chef login: chef@dinexis.com / chef123');
    console.log('Rider login: rider@dinexis.com / rider123');
    
    process.exit();
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedUsers();
