const express = require('express');
const router = express.Router();
const { 
    getSalesReport, 
    getStaffReport, 
    getInventoryReport, 
    getFinancialReport, 
    getDailyClosingReport,
    exportReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAdmin } = require('../middleware/adminMiddleware');

// All report routes are admin only
router.use(protect, onlyAdmin);

router.get('/sales', getSalesReport);
router.get('/staff', getStaffReport);
router.get('/inventory', getInventoryReport);
router.get('/finance', getFinancialReport);
router.get('/daily-closing', getDailyClosingReport);
router.get('/export/:type/:format', exportReport);

module.exports = router;

module.exports = router;
