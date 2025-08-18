const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/filter', productController.filterProducts);
router.get('/brands', productController.getBrands);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/compare', authMiddleware, productController.compareProducts);

module.exports = router;