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
  getPaymentIntent,
} = require('../controllers/orderController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/clerkAuth');
const { admin, staff } = require('../middleware/roleAuth');

router.route('/')
  .post(ClerkExpressRequireAuth(), protect, addOrderItems)
  .get(ClerkExpressRequireAuth(), protect, admin, getOrders);

router.route('/payment-intent')
  .post(ClerkExpressRequireAuth(), protect, getPaymentIntent);

router.route('/myorders')
  .get(ClerkExpressRequireAuth(), protect, getMyOrders);

router.route('/:id')
  .get(ClerkExpressRequireAuth(), protect, getOrderById);

router.route('/:id/receipt')
  .get(ClerkExpressRequireAuth(), protect, getOrderReceipt);

router.route('/:id/pay')
  .put(ClerkExpressRequireAuth(), protect, updateOrderToPaid);

router.route('/:id/status')
  .put(ClerkExpressRequireAuth(), protect, staff, updateOrderStatus);

module.exports = router;
