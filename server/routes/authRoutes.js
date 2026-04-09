const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, syncUser, getCart, updateCart, getLoyaltyStatus, deleteUserAccount } = require('../controllers/authController');
const { protect, clerkAuth } = require('../middleware/authMiddleware');

// Sync route: only needs a valid JWT, not a DB user (upserts the user)
router.post('/sync', clerkAuth, syncUser);

// All routes below require full protection (valid JWT + DB user)
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.route('/cart').get(getCart).post(updateCart);
router.get('/loyalty', getLoyaltyStatus);
router.delete('/delete', deleteUserAccount);

module.exports = router;
