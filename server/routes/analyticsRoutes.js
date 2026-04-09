const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAdmin } = require('../middleware/adminMiddleware');

// Analytics endpoints
router.get('/dashboard', protect, onlyAdmin, getAdminStats);

module.exports = router;
