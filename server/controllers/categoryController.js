const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all unique categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    try {
        // Get all unique categories from products
        const categories = await Product.distinct('category').lean();
        
        // Return as array of objects for frontend compatibility
        const formattedCategories = (categories || []).map(cat => ({
            _id: cat,
            name: cat,
            label: cat
        }));

        res.json(formattedCategories);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch categories');
    }
});

// @desc    Get products by category
// @route   GET /api/categories/:categoryName/products
// @access  Public
const getCategoryProducts = asyncHandler(async (req, res) => {
    const { categoryName } = req.params;

    if (!categoryName) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const products = await Product.find({ category: categoryName }).lean();

    res.json(products || []);
});

module.exports = {
    getCategories,
    getCategoryProducts
};
