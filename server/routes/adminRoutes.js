const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAdmin } = require('../middleware/adminMiddleware');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.use(ClerkExpressRequireAuth(), protect, onlyAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
