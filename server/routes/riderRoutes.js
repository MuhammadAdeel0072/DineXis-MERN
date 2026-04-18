const express = require('express');
const router = express.Router();
const {
    getAvailableOrders,
    getMyOrders,
    acceptOrder,
    rejectOrder,
    updateDeliveryStatus,
    updateLocation,
    getRiderStats
} = require('../controllers/riderController');
const { protect } = require('../middleware/authMiddleware');
const { riderMiddleware } = require('../middleware/riderMiddleware');

router.use(protect);
router.use(riderMiddleware);

router.get('/available', getAvailableOrders);
router.get('/my-orders', getMyOrders);
router.patch('/accept', acceptOrder);
router.patch('/reject', rejectOrder);
router.patch('/status', updateDeliveryStatus);
router.patch('/location', updateLocation);
router.get('/stats', getRiderStats);

module.exports = router;
