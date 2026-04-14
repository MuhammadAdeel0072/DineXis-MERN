const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const { generatePDFReport, generateExcelReport } = require('../services/reportService');

// Helper to get date range
const getDateQuery = (startDate, endDate) => {
    let query = {};
    if (!startDate && !endDate) return query; // Return all for Lifetime view

    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
    }
    return query;
};

// @desc    Get Sales Report
// @route   GET /api/reports/sales
const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateQuery = getDateQuery(startDate, endDate);

    const orders = await Order.find(dateQuery).sort('-createdAt');

    // Align with Dashboard: Sum (totalPrice - taxPrice) for paid orders
    const totalSales = orders.reduce((acc, order) => {
        if (!order.isPaid) return acc;
        const tax = order.taxPrice || 0;
        return acc + (order.totalPrice - tax);
    }, 0);
    const orderCount = orders.length;

    const paymentTypes = orders.reduce((acc, order) => {
        const method = order.paymentMethod || 'Unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});

    res.json({
        totalSales,
        orderCount,
        paymentTypes,
        orders: orders.map(o => ({
            id: o._id,
            orderNumber: o.orderNumber,
            customerName: o.shippingAddress?.fullName || 'Guest',
            totalPrice: o.totalPrice,
            paymentMethod: o.paymentMethod,
            isPaid: o.isPaid,
            createdAt: o.createdAt
        }))
    });
});

// @desc    Get Staff Report
// @route   GET /api/reports/staff
const getStaffReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateQuery = getDateQuery(startDate, endDate);

    const staffList = await User.find({ role: { $in: ['chef', 'rider', 'admin'] } }).select('firstName lastName email role');
    const orders = await Order.find(dateQuery);

    const staffPerformance = staffList.map(member => {
        const handledOrders = orders.filter(o => 
            (o.rider && o.rider.toString() === member._id.toString()) || 
            (o.chef && o.chef.toString() === member._id.toString())
        );
        
        return {
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            role: member.role,
            ordersCount: handledOrders.length,
            totalValue: handledOrders.reduce((acc, o) => acc + o.totalPrice, 0)
        };
    });

    res.json(staffPerformance);
});

// @desc    Get Inventory Report
// @route   GET /api/reports/inventory
const getInventoryReport = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort('name');

    const inventoryData = products.map(p => ({
        id: p._id,
        name: p.name,
        available: p.countInStock,
        lowStockThreshold: p.lowStockThreshold || 10,
        isLowStock: p.countInStock <= (p.lowStockThreshold || 10),
        status: p.countInStock === 0 ? 'Out of Stock' : (p.countInStock <= (p.lowStockThreshold || 10) ? 'Low Stock' : 'Available')
    }));

    res.json(inventoryData);
});

// @desc    Get Financial Report
// @route   GET /api/reports/finance
const getFinancialReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateQuery = getDateQuery(startDate, endDate);

    const orders = await Order.find({ ...dateQuery, isPaid: true });
    const expenses = await Expense.find(dateQuery);

    const totalIncome = orders.reduce((acc, o) => acc + (o.totalPrice - (o.taxPrice || 0)), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    res.json({
        totalIncome,
        totalExpenses,
        netProfit,
        incomeData: orders.map(o => ({ id: o._id, amount: o.totalPrice, date: o.createdAt })),
        expenseItems: expenses
    });
});

// @desc    Get Daily Closing Report
// @route   GET /api/reports/daily-closing
const getDailyClosingReport = asyncHandler(async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
    const expenses = await Expense.find({ createdAt: { $gte: start, $lte: end } });

    const dailyRevenue = orders.reduce((acc, o) => {
        if (!o.isPaid) return acc;
        return acc + (o.totalPrice - (o.taxPrice || 0));
    }, 0);
    const dailyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    res.json({
        date: start.toISOString().split('T')[0],
        totalOrders: orders.length,
        totalSales: dailyRevenue,
        totalExpenses: dailyExpenses,
        finalProfit: dailyRevenue - dailyExpenses,
        orders: orders.map(o => ({ id: o._id, number: o.orderNumber, amount: o.totalPrice, status: o.status })),
        expenses: expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category }))
    });
});

// @desc    Export Reports
// @route   GET /api/reports/export/:type/:format
const exportReport = asyncHandler(async (req, res) => {
    const { type, format } = req.params;
    const { startDate, endDate, date } = req.query;
    
    let data = [];
    let headers = [];
    let title = "";

    if (type === 'sales') {
        const query = getDateQuery(startDate, endDate);
        const orders = await Order.find(query).sort('-createdAt');
        title = "Sales Report";
        headers = ["Order #", "Date", "Customer", "Amount", "Method", "Status"];
        data = orders.map(o => [
            o.orderNumber, 
            new Date(o.createdAt).toLocaleDateString(), 
            o.shippingAddress.fullName || 'Guest', 
            `Rs. ${o.totalPrice}`, 
            o.paymentMethod, 
            o.status
        ]);
    } else if (type === 'staff') {
        const query = getDateQuery(startDate, endDate);
        const staffList = await User.find({ role: { $in: ['chef', 'rider', 'admin'] } });
        const orders = await Order.find(query);
        title = "Staff Performance Report";
        headers = ["Staff Name", "Role", "Orders Handled", "Total Value Generated"];
        data = staffList.map(member => {
            const handled = orders.filter(o => 
                (o.rider && o.rider.toString() === member._id.toString()) || 
                (o.chef && o.chef.toString() === member._id.toString())
            );
            return [`${member.firstName} ${member.lastName}`, member.role, handled.length, `Rs. ${handled.reduce((acc, o) => acc + o.totalPrice, 0)}`];
        });
    } else if (type === 'inventory') {
        const products = await Product.find({});
        title = "Inventory Report";
        headers = ["Product Name", "Stock Level", "Threshold", "Status"];
        data = products.map(p => [
            p.name, 
            p.countInStock, 
            p.lowStockThreshold || 10, 
            p.countInStock <= (p.lowStockThreshold || 10) ? 'LOW STOCK' : 'IN STOCK'
        ]);
    } else if (type === 'finance') {
        const query = getDateQuery(startDate, endDate);
        const orders = await Order.find({ ...query, isPaid: true });
        const expenses = await Expense.find(query);
        title = "Financial Ledger Report";
        headers = ["Metric", "Description", "Amount"];
        data = [
            ["Total Income", "Revenue from all paid orders", `Rs. ${orders.reduce((acc, o) => acc + o.totalPrice, 0)}`],
            ["Total Expenses", "Operating costs and overhead", `Rs. ${expenses.reduce((acc, e) => acc + e.amount, 0)}`],
            ["Net Profit", "Income after expenses", `Rs. ${orders.reduce((acc, o) => acc + o.totalPrice, 0) - expenses.reduce((acc, e) => acc + e.amount, 0)}`]
        ];
    } else if (type === 'daily') {
        const d = date ? new Date(date) : new Date();
        const start = new Date(d); start.setHours(0,0,0,0);
        const end = new Date(d); end.setHours(23,59,59,999);
        const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
        const expenses = await Expense.find({ createdAt: { $gte: start, $lte: end } });
        title = `Daily Closing - ${start.toLocaleDateString()}`;
        headers = ["Activity", "Count/Details", "Financial Impact"];
        const net = orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0) - expenses.reduce((acc, e) => acc + e.amount, 0);
        data = [
            ["Total Orders", orders.length, ""],
            ["Daily Sales", "Revenue through checkout", `Rs. ${orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0)}`],
            ["Daily Expenses", "Logged business costs", `Rs. ${expenses.reduce((acc, e) => acc + e.amount, 0)}`],
            ["Final Profit", "Daily liquidity change", `Rs. ${net}`]
        ];
    }

    if (format === 'pdf') {
        generatePDFReport(res, title, headers, data);
    } else {
        await generateExcelReport(res, title, headers, data);
    }
});

module.exports = {
    getSalesReport,
    getStaffReport,
    getInventoryReport,
    getFinancialReport,
    getDailyClosingReport,
    exportReport
};
