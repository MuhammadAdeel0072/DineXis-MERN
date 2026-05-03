const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { emitEvent } = require('../services/socketService');
const { getCachedMenu, setCachedMenu, clearMenuCache } = require('../services/cacheService');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, isSpecial, dietary } = req.query;
  
  // Try to get from cache if no filters
  if (!category && !isSpecial && !dietary && !req.query.mood) {
    const cached = getCachedMenu();
    if (cached) return res.json(cached);
  }

  const query = {};
  if (category) query.category = category;
  if (isSpecial) query.isSpecial = isSpecial === 'true';
  if (dietary) query.dietaryInfo = { $in: dietary.split(',') };
  
  // Mood filtering
  if (req.query.mood) {
    const moodMap = {
      'hungry': ['heavy'],
      'budget': ['budget'],
      'quick': ['quick'],
      'premium': ['premium']
    };
    const tags = moodMap[req.query.mood.toLowerCase()];
    if (tags) {
      query.tags = { $in: tags };
    }
  }

  let products = await Product.find(query).lean();
  
  // Safety check for empty results or missing image URLs
  products = (products || []).map(product => ({
    ...product,
    image: product.image || '/images/sample.jpg'
  }));
  
  // Set cache if no filters
  if (!category && !isSpecial && !dietary && !req.query.mood) {
    setCachedMenu(products);
  }

  res.json(products);
});

// @desc    Fetch products by mood
// @route   GET /api/products/mood/:mood
// @access  Public
const getProductsByMood = asyncHandler(async (req, res) => {
  const moodMap = {
    hungry: ["heavy"],
    budget: ["budget"],
    quick: ["quick"],
    premium: ["premium"]
  };
  const mood = req.params.mood.toLowerCase();
  const tags = moodMap[mood];

  if (!tags) {
    return res.status(400).json({ message: "Invalid mood" });
  }

  let products = await Product.find({
    tags: { $in: tags }
  }).lean();
  
  // Safety check for empty results or missing image URLs
  products = (products || []).map(product => ({
    ...product,
    image: product.image || '/images/sample.jpg'
  }));

  res.json({ success: true, data: products });
});


// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, category, countInStock, isSpecial, dietaryInfo, hasVariants, variants, tags } = req.body;

  // Basic validation
  if (!name || !category) {
    res.status(400);
    throw new Error('Please provide name and category');
  }

  // Gracefully handle empty variants
  const finalHasVariants = hasVariants && variants && variants.length > 0;
  const finalVariants = finalHasVariants ? variants : [];

  const product = new Product({
    name,
    price: price || 0,
    image: image || '/images/sample.jpg',
    category,
    countInStock: countInStock || 0,
    description: description || '',
    isSpecial: isSpecial || false,
    dietaryInfo: dietaryInfo || [],
    hasVariants: finalHasVariants,
    variants: finalVariants,
    tags: tags || [],
  });

  const createdProduct = await product.save();
  
  clearMenuCache();
  emitEvent(null, 'productUpdated', createdProduct);
  emitEvent(null, 'adminAction', { type: 'menuUpdate' });

  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, category, countInStock, isSpecial, dietaryInfo, hasVariants, variants, tags } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Gracefully handle empty variants
    const finalHasVariants = hasVariants && variants && variants.length > 0;
    const finalVariants = finalHasVariants ? variants : [];

    product.name = name || product.name;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.isSpecial = isSpecial !== undefined ? isSpecial : product.isSpecial;
    product.dietaryInfo = dietaryInfo || product.dietaryInfo;
    product.hasVariants = finalHasVariants;
    product.variants = finalVariants;
    product.price = price !== undefined ? price : product.price;
    product.tags = tags || product.tags;

    const updatedProduct = await product.save();

    clearMenuCache();
    emitEvent(null, 'productUpdated', updatedProduct);
    emitEvent(null, 'adminAction', { type: 'menuUpdate' });

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });

    clearMenuCache();
    emitEvent(null, 'productUpdated', { _id: product._id, deleted: true });
    emitEvent(null, 'adminAction', { type: 'menuUpdate' });

    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductsByMood,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
