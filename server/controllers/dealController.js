const asyncHandler = require('express-async-handler');
const Deal = require('../models/Deal');
const { emitEvent } = require('../services/socketService');

// @desc    Fetch all deals
// @route   GET /api/deals
// @access  Public
const getDeals = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    const deals = await Deal.find(query)
        .populate('productId', 'name image price')
        .lean();

    res.json(deals || []);
});

// @desc    Fetch single deal
// @route   GET /api/deals/:id
// @access  Public
const getDealById = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id)
        .populate('productId', 'name image price')
        .lean();

    if (deal) {
        res.json(deal);
    } else {
        res.status(404);
        throw new Error('Deal not found');
    }
});

// @desc    Create a deal
// @route   POST /api/deals
// @access  Private/Admin
const createDeal = asyncHandler(async (req, res) => {
    const { title, description, discountPercentage, discountAmount, productId, category, isActive, startDate, endDate, image } = req.body;

    if (!title || (discountPercentage === undefined && discountAmount === undefined)) {
        res.status(400);
        throw new Error('Please provide title and at least one discount type');
    }

    const deal = new Deal({
        title,
        description: description || '',
        discountPercentage: discountPercentage || 0,
        discountAmount: discountAmount || 0,
        productId: productId || null,
        category: category || null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate || Date.now(),
        endDate: endDate || null,
        image: image || null
    });

    const createdDeal = await deal.save();
    emitEvent(null, 'dealCreated', createdDeal);
    
    res.status(201).json(createdDeal);
});

// @desc    Update a deal
// @route   PUT /api/deals/:id
// @access  Private/Admin
const updateDeal = asyncHandler(async (req, res) => {
    let deal = await Deal.findById(req.params.id);

    if (!deal) {
        res.status(404);
        throw new Error('Deal not found');
    }

    const { title, description, discountPercentage, discountAmount, productId, category, isActive, startDate, endDate, image } = req.body;

    deal.title = title || deal.title;
    deal.description = description !== undefined ? description : deal.description;
    deal.discountPercentage = discountPercentage !== undefined ? discountPercentage : deal.discountPercentage;
    deal.discountAmount = discountAmount !== undefined ? discountAmount : deal.discountAmount;
    deal.productId = productId !== undefined ? productId : deal.productId;
    deal.category = category !== undefined ? category : deal.category;
    deal.isActive = isActive !== undefined ? isActive : deal.isActive;
    deal.startDate = startDate || deal.startDate;
    deal.endDate = endDate !== undefined ? endDate : deal.endDate;
    deal.image = image !== undefined ? image : deal.image;

    const updatedDeal = await deal.save();
    emitEvent(null, 'dealUpdated', updatedDeal);

    res.json(updatedDeal);
});

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private/Admin
const deleteDeal = asyncHandler(async (req, res) => {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
        res.status(404);
        throw new Error('Deal not found');
    }

    await Deal.findByIdAndDelete(req.params.id);
    emitEvent(null, 'dealDeleted', req.params.id);

    res.json({ message: 'Deal removed' });
});

module.exports = {
    getDeals,
    getDealById,
    createDeal,
    updateDeal,
    deleteDeal
};
