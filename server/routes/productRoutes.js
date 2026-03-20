const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.route('/')
  .get(getProducts)
  .post(ClerkExpressRequireAuth(), protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(ClerkExpressRequireAuth(), protect, admin, updateProduct)
  .delete(ClerkExpressRequireAuth(), protect, admin, deleteProduct);

module.exports = router;
