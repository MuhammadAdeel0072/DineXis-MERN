const Product = require('../models/Product');
const { emitEvent } = require('./socketService');

/**
 * Deduct stock from products based on order items
 * @param {Array} orderItems - items from the order
 */
const deductStock = async (orderItems) => {
    try {
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            
            if (product) {
                product.countInStock -= item.qty;
                if (product.countInStock < 0) product.countInStock = 0;
                
                const updatedProduct = await product.save();
                
                // Emit alert if stock is low
                const threshold = updatedProduct.lowStockThreshold || 10;
                if (updatedProduct.countInStock <= threshold) {
                    emitEvent('admin', 'inventoryAlert', {
                        id: updatedProduct._id,
                        name: updatedProduct.name,
                        currentStock: updatedProduct.countInStock,
                        status: updatedProduct.countInStock === 0 ? 'out-of-stock' : 'low-stock'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error during stock deduction:', error.message);
    }
};

module.exports = { deductStock };
