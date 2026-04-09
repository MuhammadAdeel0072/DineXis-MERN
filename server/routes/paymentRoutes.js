const express = require('express');
const router = express.Router();
const { getPaymentConfig, updatePaymentConfig } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/config')
    .get(getPaymentConfig)
    .put(protect, admin, updatePaymentConfig);

module.exports = router;
