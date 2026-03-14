const User = require('../models/User');

const assignDriver = async (orderId) => {
  // Logic to find an available staff member with 'driver' metadata or just any staff
  // For this implementation, we'll find a user with role 'staff'
  const availableStaff = await User.findOne({ role: 'staff' });
  
  if (availableStaff) {
    return availableStaff._id;
  }
  return null;
};

module.exports = { assignDriver };
