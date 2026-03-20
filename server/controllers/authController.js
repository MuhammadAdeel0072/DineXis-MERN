const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Cart = require('../models/Cart');
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
// @access  Private
const syncUser = asyncHandler(async (req, res) => {
  const { clerkId, email, firstName, lastName, avatar } = req.body;

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

module.exports = { getUserProfile, syncUser, getCart, updateCart, getLoyaltyStatus };
