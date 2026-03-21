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
const { protect, ClerkExpressRequireAuth } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .post(ClerkExpressRequireAuth(), protect, addOrderItems)
  .get(ClerkExpressRequireAuth(), protect, admin, getOrders);

router.route('/myorders')
  .get(ClerkExpressRequireAuth(), protect, getMyOrders);

router.route('/:id')
  .get(ClerkExpressRequireAuth(), protect, getOrderById);

router.route('/:id/receipt')
  .get(ClerkExpressRequireAuth(), protect, getOrderReceipt);

router.route('/:id/pay')
  .put(ClerkExpressRequireAuth(), protect, updateOrderToPaid);

router.route('/:id/status')
  .put(ClerkExpressRequireAuth(), protect, admin, updateOrderStatus);

module.exports = router;
