const express = require('express');
const router = express.Router();
const {
    getDeals,
    getDealById,
    createDeal,
    updateDeal,
    deleteDeal
} = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
    .get(getDeals)
    .post(protect, admin, createDeal);

router.route('/:id')
    .get(getDealById)
    .put(protect, admin, updateDeal)
    .delete(protect, admin, deleteDeal);

module.exports = router;
