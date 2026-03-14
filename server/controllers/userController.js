const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      clerkId: user.clerkId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    
    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      addresses: updatedUser.addresses,
      loyaltyPoints: updatedUser.loyaltyPoints,
      loyaltyTier: updatedUser.loyaltyTier,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add product to favorites
// @route   POST /api/users/favorites/:productId
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (!user.favorites.includes(req.params.productId)) {
      user.favorites.push(req.params.productId);
      await user.save();
    }
    res.json({ message: 'Added to favorites' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Remove product from favorites
// @route   DELETE /api/users/favorites/:productId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ message: 'Removed from favorites' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user cart
// @route   PUT /api/users/cart
// @access  Private
const updateUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.cartItems = req.body.cartItems;
    await user.save();
    res.json(user.cartItems);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json(user.cartItems);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  updateUserCart,
  getUserCart,
};
