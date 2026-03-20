const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .post(ClerkExpressRequireAuth(), protect, createReservation)
  .get(ClerkExpressRequireAuth(), protect, staff, getReservations);

router.route('/my')
  .get(ClerkExpressRequireAuth(), protect, getMyReservations);

router.route('/:id/status')
  .put(ClerkExpressRequireAuth(), protect, staff, updateReservationStatus);

module.exports = router;
