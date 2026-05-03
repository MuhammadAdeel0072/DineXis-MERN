const express = require('express');
const router = express.Router();
const { getCart, updateCart, clearCart } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes are protected as they belong to a user
router.use(protect);

router.route('/')
  .get(getCart)
  .post(updateCart)
  .delete(clearCart);

module.exports = router;
