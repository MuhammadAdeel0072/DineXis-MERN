const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  updateUserCart,
  getUserCart,
  getUsers,
  getUserById,
} = require('../controllers/userController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/clerkAuth');
const { admin } = require('../middleware/roleAuth');

router.route('/')
  .get(ClerkExpressRequireAuth(), protect, admin, getUsers);

router.route('/profile')
  .get(ClerkExpressRequireAuth(), protect, getUserProfile)
  .put(ClerkExpressRequireAuth(), protect, updateUserProfile);

router.route('/cart')
  .get(ClerkExpressRequireAuth(), protect, getUserCart)
  .put(ClerkExpressRequireAuth(), protect, updateUserCart);

router.route('/favorites/:productId')
  .post(ClerkExpressRequireAuth(), protect, addFavorite)
  .delete(ClerkExpressRequireAuth(), protect, removeFavorite);

router.route('/:id')
  .get(ClerkExpressRequireAuth(), protect, admin, getUserById);

module.exports = router;
