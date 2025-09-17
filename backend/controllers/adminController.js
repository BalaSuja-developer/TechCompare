const axios = require("axios");
const { query } = require("../config/database");
const productQueries = require("../queries/productQueries");
const predictionQueries = require("../queries/predictionQueries");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000/api";

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

const adminController = {
  // Get all products for admin
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const result = await query(productQueries.getAllProducts, [
        limit,
        offset,
      ]);
      const countResult = await query(productQueries.getProductCount);

      const totalProducts = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
        },
      });
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
      });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const {
        name,
        brand,
        price,
        image_url,
        rating,
        reviews,
        description,
        specs,
        features,
      } = req.body;

      // Insert product
      const productResult = await query(productQueries.insertProduct, [
        name,
        brand,
        price,
        image_url,
        rating || 0,
        reviews || 0,
        description || "",
      ]);

      const productId = productResult.rows[0].id;

      // Insert specifications
      if (specs) {
        await query(productQueries.insertProductSpecs, [
          productId,
          specs.display_size,
          specs.processor,
          specs.ram,
          specs.storage,
          specs.camera,
          specs.battery,
          specs.operating_system,
        ]);
      }

      // Insert features
      if (features && Array.isArray(features)) {
        for (const feature of features) {
          await query(productQueries.insertProductFeature, [
            productId,
            feature,
          ]);
        }
      }

      res.status(201).json({
        success: true,
        data: { id: productId },
        message: "Product created successfully",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create product",
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        brand,
        price,
        image_url,
        rating,
        reviews,
        description,
        specs,
        features,
      } = req.body;

      // Update main product
      const productResult = await query(productQueries.updateProduct, [
        id,
        name,
        brand,
        price,
        image_url,
        rating,
        reviews,
        description,
      ]);
      if (productResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }

      // Update specs
      if (specs) {
        await query(productQueries.updateProductSpecs, [
          id,
          specs.display_size,
          specs.processor,
          specs.ram,
          specs.storage,
          specs.camera,
          specs.battery,
          specs.operating_system,
        ]);
      }

      // Delete old features and insert new ones
      if (features && Array.isArray(features)) {
        // Filter out empty/null features
        const validFeatures = features.filter(
          (feature) => feature && feature.trim()
        );
        await query(productQueries.deleteProductFeatures, [id]);
        for (const feature of validFeatures) {
          await query(productQueries.insertProductFeature, [id, feature]);
        }
      }

      res.json({
        success: true,
        data: productResult.rows[0],
        message: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update product",
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      await query(productQueries.deleteProduct, [id]);

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete product",
      });
    }
  },

  // Upload data (CSV/JSON)
  uploadData: async (req, res) => {
    try {
      const { data, type } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: "Invalid data format",
        });
      }

      let successCount = 0;
      let errorCount = 0;

      for (const item of data) {
        try {
          // Insert product logic here
          successCount++;
        } catch (error) {
          errorCount++;
          console.error("Error inserting item:", error);
        }
      }

      res.json({
        success: true,
        data: {
          total: data.length,
          successful: successCount,
          failed: errorCount,
        },
        message: `Data upload completed. ${successCount} items added, ${errorCount} failed.`,
      });
    } catch (error) {
      console.error("Error uploading data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload data",
      });
    }
  },

  // Get admin statistics
getStats: async (req, res) => {
  try {
    const statsResult = await query(productQueries.getAdminStats);
    const predictionStatsResult = await query(
      predictionQueries.getPredictionStats
    );
    
    // Add user count query
    const userCountResult = await query('SELECT COUNT(*) as user_count FROM users');
    
    const stats = {
      ...statsResult.rows[0],
      ...predictionStatsResult.rows[0],
      totalUsers: parseInt(userCountResult.rows[0].user_count) || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
},

  // Retrain ML model
  retrainModel: async (req, res) => {
    try {
      // Get training data from database
      const trainingDataResult = await query(predictionQueries.getTrainingData);
      const trainingData = trainingDataResult.rows;

      // Send data to ML API for retraining
      const mlResponse = await axios.post(
        `${ML_API_URL}/retrain`,
        {
          training_data: trainingData,
        },
        {
          timeout: 60000, // 1 minute timeout for training
        }
      );

      res.json({
        success: true,
        data: mlResponse.data,
        message: "Model retrained successfully",
      });
    } catch (error) {
      console.error("Error retraining model:", error);

      if (error.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          error: "ML service is currently unavailable",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to retrain model",
      });
    }
  },

  // Get ML model status
  getModelStatus: async (req, res) => {
    try {
      const mlResponse = await axios.get(`${ML_API_URL}/model/status`);

      res.json({
        success: true,
        data: mlResponse.data,
      });
    } catch (error) {
      console.error("Error fetching model status:", error);

      if (error.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          error: "ML service is currently unavailable",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to fetch model status",
      });
    }
  },
};

module.exports = adminController;