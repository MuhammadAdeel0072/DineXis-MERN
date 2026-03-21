const express = require('express');
const router = express.Router();
const { getUserProfile, syncUser, getCart, updateCart, getLoyaltyStatus } = require('../controllers/authController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/authMiddleware');

router.post('/sync', ClerkExpressRequireAuth(), syncUser);

// All routes below are protected
router.use(ClerkExpressRequireAuth(), protect);

router.get('/profile', getUserProfile);
router.route('/cart').get(getCart).post(updateCart);
router.get('/loyalty', getLoyaltyStatus);

module.exports = router;
