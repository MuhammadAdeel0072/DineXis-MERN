const asyncHandler = require('express-async-handler');
const PaymentConfig = require('../models/PaymentConfig');

// @desc    Get payment configuration
// @route   GET /api/payments/config
// @access  Public
const getPaymentConfig = asyncHandler(async (req, res) => {
    let config = await PaymentConfig.findOne();
    
    // If no config exists, create a default one (Simulation convenience)
    if (!config) {
        config = await PaymentConfig.create({});
    }
    
    res.json(config);
});

// @desc    Update payment configuration
// @route   PUT /api/payments/config
// @access  Private/Admin
const updatePaymentConfig = asyncHandler(async (req, res) => {
    const { easypaisaNumber, jazzcashNumber, bankAccount, accountTitle, bankName } = req.body;

    let config = await PaymentConfig.findOne();

    if (config) {
        config.easypaisaNumber = easypaisaNumber || config.easypaisaNumber;
        config.jazzcashNumber = jazzcashNumber || config.jazzcashNumber;
        config.bankAccount = bankAccount || config.bankAccount;
        config.accountTitle = accountTitle || config.accountTitle;
        config.bankName = bankName || config.bankName;

        const updatedConfig = await config.save();
        res.json(updatedConfig);
    } else {
        const newConfig = await PaymentConfig.create({
            easypaisaNumber,
            jazzcashNumber,
            bankAccount,
            accountTitle,
            bankName
        });
        res.status(201).json(newConfig);
    }
});

module.exports = {
    getPaymentConfig,
    updatePaymentConfig
};
