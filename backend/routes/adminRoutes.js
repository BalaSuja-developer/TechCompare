const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require admin role
router.use(adminMiddleware);

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

// Product management
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Data management
router.post('/upload', adminController.uploadData);
router.get('/stats', adminController.getStats);

// ML model management
router.post('/retrain', adminController.retrainModel);
router.get('/model/status', adminController.getModelStatus);

module.exports = router;