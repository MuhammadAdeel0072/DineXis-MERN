const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect, ClerkExpressRequireAuth } = require('../middleware/clerkAuth');
const { admin } = require('../middleware/roleAuth');

router.get('/dashboard', ClerkExpressRequireAuth(), protect, admin, getDashboardStats);

module.exports = router;
