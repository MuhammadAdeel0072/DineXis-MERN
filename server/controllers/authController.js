const asyncHandler = require('express-async-handler');
const { clerkClient } = require('@clerk/express');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const LoyaltyTransaction = require('../models/Loyalty');

// @desc    Get user profile (Self)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Sync Clerk User with Database
// @route   POST /api/auth/sync
// @access  Clerk JWT (no DB user required)
const syncUser = asyncHandler(async (req, res) => {
  const clerkId = req.clerkUserId || req.body.clerkId;
  const { email, firstName, lastName, avatar } = req.body;

  if (!clerkId) {
    res.status(400);
    throw new Error('clerkId is required');
  }

  let user = await User.findOne({ clerkId });

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    await user.save();
  } else {
    user = await User.create({
      clerkId,
      email: email || '',
      firstName: firstName || '',
      lastName: lastName || '',
      avatar: avatar || '',
      role: 'customer'
    });
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { firstName, lastName, phoneNumber, address, avatar } = req.body;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (address !== undefined) user.address = address;
  if (avatar !== undefined) user.avatar = avatar;

  const updated = await user.save();
  res.json(updated);
});

// --- CART FEATURES ---

// @desc    Get user cart
// @route   GET /api/auth/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).lean();
  res.json(cart ? cart.items : []);
});

// @desc    Update user cart
// @route   POST /api/auth/cart
const updateCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = cartItems;
    await cart.save();
  } else {
    cart = await Cart.create({ user: req.user._id, items: cartItems });
  }
  res.json(cart.items);
});

// --- LOYALTY FEATURES ---

// @desc    Get loyalty status
// @route   GET /api/auth/loyalty
const getLoyaltyStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('loyaltyPoints loyaltyTier').lean();
  const transactions = await LoyaltyTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ ...user, transactions });
});

// @desc    Delete user account
// @route   DELETE /api/auth/delete
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  // Get user ID from request
  const userId = req.user?._id;

  if (!userId) {
    res.status(400);
    throw new Error('User ID not found in request');
  }

  // Find user to get clerkId before deletion
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Delete from Clerk if clerkId exists (only in production)
  if (user.clerkId && user.clerkId !== 'dev_user') {
    try {
      await clerkClient.users.deleteUser(user.clerkId);
      console.log(`Clerk user deleted: ${user.clerkId}`);
    } catch (error) {
      console.error('Clerk deletion error:', error);
      // Continue even if Clerk deletion fails (user might already be deleted)
    }
  }

  // Delete all user-related data from MongoDB
  try {
    // Delete cart
    await Cart.findOneAndDelete({ user: userId });
    
    // Delete loyalty transactions
    await LoyaltyTransaction.deleteMany({ user: userId });
    
    // Delete orders (keep for audit trail in production, but delete in dev)
    if (process.env.NODE_ENV === 'development') {
      await Order.deleteMany({ user: userId });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ 
      success: true,
      message: 'Account and all associated data successfully deleted' 
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500);
    throw new Error('Failed to delete account. Please try again.');
  }
});

module.exports = { getUserProfile, updateUserProfile, syncUser, getCart, updateCart, getLoyaltyStatus, deleteUserAccount };
