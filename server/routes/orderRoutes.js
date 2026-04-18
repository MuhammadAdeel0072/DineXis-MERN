const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getOrderReceipt,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/receipt')
  .get(protect, getOrderReceipt);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

// Chef Action APIs
const { startCooking, markReady, dispatchOrder } = require('../controllers/orderController');

router.route('/:id/start')
  .put(protect, startCooking);

router.route('/:id/ready')
  .put(protect, markReady);

router.route('/:id/dispatch')
  .put(protect, dispatchOrder);

module.exports = router;
