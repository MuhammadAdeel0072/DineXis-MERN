const express = require('express');
const router = express.Router();
const {
  getStaffStats,
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  markAttendance,
  bulkMarkAttendance,
  getAttendance,
  updateSalary,
  updateShifts,
  updatePerformance
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAdmin } = require('../middleware/adminMiddleware');

// All routes require admin authentication
router.use(protect, onlyAdmin);

// Dashboard stats (must be before /:id routes)
router.get('/dashboard/stats', getStaffStats);

// Bulk attendance
router.post('/attendance/bulk', bulkMarkAttendance);

// CRUD
router.route('/')
  .get(getAllStaff)
  .post(createStaff);

router.route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(deleteStaff);

// Attendance
router.post('/:id/attendance', markAttendance);
router.get('/:id/attendance', getAttendance);

// Salary
router.put('/:id/salary', updateSalary);

// Shifts
router.put('/:id/shifts', updateShifts);

// Performance
router.put('/:id/performance', updatePerformance);

module.exports = router;
