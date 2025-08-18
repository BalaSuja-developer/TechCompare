const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

// ML Prediction routes
router.post('/price', predictionController.predictPrice);
router.get('/history', predictionController.getPredictionHistory);
router.get('/stats', predictionController.getPredictionStats);

module.exports = router;