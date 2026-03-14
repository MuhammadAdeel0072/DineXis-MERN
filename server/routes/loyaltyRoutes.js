const express = require('express');
const router = express.Router();
const {
  getLoyaltyProfile,
  getLoyaltyTransactions,
} = require('../controllers/loyaltyController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/clerkAuth');

router.route('/profile')
  .get(ClerkExpressRequireAuth(), protect, getLoyaltyProfile);

router.route('/transactions')
  .get(ClerkExpressRequireAuth(), protect, getLoyaltyTransactions);

module.exports = router;
