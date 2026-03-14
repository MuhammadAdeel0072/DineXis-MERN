const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/Loyalty');

// @desc    Get user loyalty points and tier
// @route   GET /api/loyalty/profile
// @access  Private
const getLoyaltyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('loyaltyPoints loyaltyTier');
  res.json(user);
});

// @desc    Get loyalty transactions
// @route   GET /api/loyalty/transactions
// @access  Private
const getLoyaltyTransactions = asyncHandler(async (req, res) => {
  const transactions = await LoyaltyTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(transactions);
});

// Helper to add loyalty points
const addLoyaltyPoints = async (userId, points, description, orderId = null) => {
  const user = await User.findById(userId);
  if (user) {
    user.loyaltyPoints += points;
    
    // Tier update logic
    if (user.loyaltyPoints >= 5000) user.loyaltyTier = 'Platinum';
    else if (user.loyaltyPoints >= 2500) user.loyaltyTier = 'Gold';
    else if (user.loyaltyPoints >= 1000) user.loyaltyTier = 'Silver';

    await user.save();

    await LoyaltyTransaction.create({
      user: userId,
      type: 'earned',
      points,
      description,
      order: orderId
    });
  }
};

module.exports = {
  getLoyaltyProfile,
  getLoyaltyTransactions,
  addLoyaltyPoints
};
