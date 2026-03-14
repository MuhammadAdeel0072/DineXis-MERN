const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  updateUserCart,
  getUserCart,
} = require('../controllers/userController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/clerkAuth');

router.route('/profile')
  .get(ClerkExpressRequireAuth(), protect, getUserProfile)
  .put(ClerkExpressRequireAuth(), protect, updateUserProfile);

router.route('/cart')
  .get(ClerkExpressRequireAuth(), protect, getUserCart)
  .put(ClerkExpressRequireAuth(), protect, updateUserCart);

router.route('/favorites/:productId')
  .post(ClerkExpressRequireAuth(), protect, addFavorite)
  .delete(ClerkExpressRequireAuth(), protect, removeFavorite);

module.exports = router;
