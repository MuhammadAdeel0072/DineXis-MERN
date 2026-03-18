const express = require('express');
const router = express.Router();
const { getPaymentConfig, updatePaymentConfig } = require('../controllers/paymentController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/clerkAuth');
const { admin } = require('../middleware/roleAuth');

router.route('/config')
    .get(getPaymentConfig)
    .put(ClerkExpressRequireAuth(), protect, admin, updatePaymentConfig);

module.exports = router;
