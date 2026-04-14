const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Chef', 'Rider', 'Waiter', 'Manager', 'Cashier', 'Admin']
  },
  salary: {
    base: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date }
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive', 'On Leave']
  },
  attendance: [{
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
  }],
  performance: {
    ordersCompleted: { type: Number, default: 0 },
    avgPrepTime: { type: Number, default: 0 }, // in minutes
    deliveryTime: { type: Number, default: 0 }, // in minutes
    deliveriesCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 }
  },
  shifts: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Off'] }
  }],
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Middleware to prevent fetching deleted staff by default
staffSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
