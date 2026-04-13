const express = require('express');
const router = express.Router();
const { getReviews, updateReviewStatus, submitReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getReviews);
router.post('/', protect, submitReview);
router.put('/:id', protect, updateReviewStatus);

module.exports = router;
