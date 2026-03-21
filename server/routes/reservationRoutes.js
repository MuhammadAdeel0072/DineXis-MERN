const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .post(ClerkExpressRequireAuth(), protect, createReservation)
  .get(ClerkExpressRequireAuth(), protect, admin, getReservations);

router.route('/my')
  .get(ClerkExpressRequireAuth(), protect, getMyReservations);

router.route('/:id/status')
  .put(ClerkExpressRequireAuth(), protect, admin, updateReservationStatus);

module.exports = router;
