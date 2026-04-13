const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/reviews
const getReviews = asyncHandler(async (req, res) => {
    const { rating, status } = req.query;
    let query = {};
    
    if (rating) query.rating = rating;
    if (status) query.status = status;

    const reviews = await Review.find(query)
        .populate('user', 'firstName lastName avatar')
        .sort({ createdAt: -1 });
        
    res.json(reviews);
});

// @desc    Update review status (Flag/Archive)
// @route   PUT /api/reviews/:id
const updateReviewStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
        review.status = status;
        await review.save();
        res.json({ message: `Review status updated to ${status}` });
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

// @desc    Submit a review (Customer)
// @route   POST /api/reviews
const submitReview = asyncHandler(async (req, res) => {
    const { rating, comment, orderId } = req.body;
    
    const review = await Review.create({
        user: req.user._id,
        order: orderId,
        rating,
        comment
    });
    
    res.status(201).json(review);
});

module.exports = {
    getReviews,
    updateReviewStatus,
    submitReview
};
