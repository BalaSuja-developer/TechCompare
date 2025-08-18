const axios = require('axios');
const { query } = require('../config/database');
const predictionQueries = require('../queries/predictionQueries');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000/api';

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

const predictionController = {
  // Predict product price using ML API
  predictPrice: async (req, res) => {
    try {
      const {
        brand,
        display,
        processor,
        ram,
        storage,
        camera,
        battery
      } = req.body;

      // Validate required fields
      if (!brand || !display || !ram || !storage) {
        return res.status(400).json({
          success: false,
          error: 'Brand, display, RAM, and storage are required fields'
        });
      }

      // Prepare data for ML API
      const mlData = {
        brand,
        display_size: display,
        processor: processor || 'Unknown',
        ram,
        storage,
        camera: camera || 'Unknown',
        battery: battery || 'Unknown'
      };

      // Call Python ML API
      const mlResponse = await axios.post(`${ML_API_URL}/predict`, mlData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { predicted_price, confidence_score, model_version } = mlResponse.data;

      // Save prediction to database
      const savedPrediction = await query(predictionQueries.savePrediction, [
        req.user.id,
        brand,
        display,
        processor,
        ram,
        storage,
        camera,
        battery,
        predicted_price,
        confidence_score,
        model_version
      ]);

      res.json({
        success: true,
        data: {
          predicted_price,
          confidence_score,
          model_version,
          prediction_id: savedPrediction.rows[0].id,
          created_at: savedPrediction.rows[0].created_at
        }
      });

    } catch (error) {
      console.error('Price prediction error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          error: 'ML service is currently unavailable'
        });
      }

      if (error.response && error.response.data) {
        return res.status(400).json({
          success: false,
          error: error.response.data.error || 'Prediction failed'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to predict price'
      });
    }
  },

  // Get user's prediction history
  getPredictionHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const result = await query(predictionQueries.getUserPredictions, [
        req.user.id,
        limit,
        offset
      ]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error fetching prediction history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch prediction history'
      });
    }
  },

  // Get prediction statistics
  getPredictionStats: async (req, res) => {
    try {
      const result = await query(predictionQueries.getPredictionStats);

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error fetching prediction stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch prediction statistics'
      });
    }
  }
};

module.exports = predictionController;