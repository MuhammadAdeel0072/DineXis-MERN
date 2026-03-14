const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Total Sales
  const orders = await Order.find({ isPaid: true });
  const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  // 2. Order counts by status
  const orderStats = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // 3. User counts
  const totalUsers = await User.countDocuments();

  // 4. Popular Items
  const popularItems = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.name', totalSold: { $sum: '$orderItems.qty' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  // 5. Sales by month (simplified)
  const salesByMonth = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.json({
    totalSales,
    orderStats,
    totalUsers,
    popularItems,
    salesByMonth
  });
});

module.exports = { getDashboardStats };
