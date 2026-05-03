require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const MONGODB_URI = process.env.MONGO_URI;

const seedStaff = [
  {
    name: "Chef Marco Pierre",
    email: "marco@dinexis.com",
    phone: "0300-1112233",
    role: "Chef",
    status: "Active",
    salary: { base: 85000, bonus: 5000, deductions: 0 },
    joiningDate: new Date('2023-01-15'),
    performance: { rating: 4.8, ordersCompleted: 1250, avgPrepTime: 12 },
    shifts: [{ day: "Monday", shift: "Morning" }, { day: "Tuesday", shift: "Morning" }, { day: "Wednesday", shift: "Morning" }, { day: "Thursday", shift: "Morning" }, { day: "Friday", shift: "Morning" }]
  },
  {
    name: "Zeeshan Ali",
    email: "zeeshan@dinexis.com",
    phone: "0321-4445566",
    role: "Rider",
    status: "Active",
    salary: { base: 25000, bonus: 3500, deductions: 500 },
    joiningDate: new Date('2023-06-10'),
    performance: { rating: 4.5, deliveriesCompleted: 850, deliveryTime: 25 },
    shifts: [{ day: "Monday", shift: "Evening" }, { day: "Tuesday", shift: "Evening" }, { day: "Wednesday", shift: "Evening" }, { day: "Thursday", shift: "Evening" }, { day: "Friday", shift: "Evening" }]
  },
  {
    name: "Sara Khan",
    email: "sara@dinexis.com",
    phone: "0345-9998877",
    role: "Cashier",
    status: "Active",
    salary: { base: 35000, bonus: 1000, deductions: 0 },
    joiningDate: new Date('2024-02-01'),
    performance: { rating: 4.9, ordersCompleted: 3200 },
    shifts: [{ day: "Monday", shift: "Morning" }, { day: "Tuesday", shift: "Morning" }, { day: "Wednesday", shift: "Morning" }, { day: "Thursday", shift: "Morning" }, { day: "Friday", shift: "Morning" }]
  },
  {
    name: "Kamran Akmal",
    email: "kamran@dinexis.com",
    phone: "0312-3334445",
    role: "Manager",
    status: "Active",
    salary: { base: 120000, bonus: 10000, deductions: 0 },
    joiningDate: new Date('2022-11-20'),
    performance: { rating: 4.7 },
    shifts: [{ day: "Monday", shift: "Evening" }, { day: "Tuesday", shift: "Evening" }, { day: "Wednesday", shift: "Evening" }, { day: "Thursday", shift: "Evening" }, { day: "Friday", shift: "Evening" }]
  },
  {
    name: "Bilal Ahmed",
    email: "bilal@dinexis.com",
    phone: "0333-7778889",
    role: "Waiter",
    status: "On Leave",
    salary: { base: 22000, bonus: 0, deductions: 0 },
    joiningDate: new Date('2023-08-05'),
    performance: { rating: 4.2, ordersCompleted: 1100 },
    shifts: [{ day: "Monday", shift: "Off" }, { day: "Tuesday", shift: "Off" }]
  }
];

async function seed() {
  try {
    if (!MONGODB_URI) throw new Error('MONGO_URI not found in .env');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    for (const s of seedStaff) {
      const exists = await Staff.findOne({ email: s.email });
      if (!exists) {
        await Staff.create(s);
        console.log(`Seeded: ${s.name}`);
      } else {
        console.log(`Skipped (exists): ${s.name}`);
      }
    }
    
    console.log('Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
