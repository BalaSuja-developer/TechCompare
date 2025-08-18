const { query } = require('../config/database');
const productQueries = require('../queries/productQueries');

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

const productController = {
  // Get all products with pagination
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const result = await query(productQueries.getAllProducts, [limit, offset]);
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
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await query(productQueries.getProductById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const searchTerm = `%${q}%`;

      const result = await query(productQueries.searchProducts, [searchTerm, limit, offset]);

      res.json({
        success: true,
        data: result.rows,
        query: q
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products'
      });
    }
  },

  // Filter products
  filterProducts: async (req, res) => {
    try {
      const { 
        brand, 
        minPrice, 
        maxPrice, 
        ram, 
        storage, 
        page = 1, 
        limit = 10 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const result = await query(productQueries.filterProducts, [
        brand || null,
        minPrice || null,
        maxPrice || null,
        ram || null,
        storage || null,
        limit,
        offset
      ]);

      res.json({
        success: true,
        data: result.rows,
        filters: { brand, minPrice, maxPrice, ram, storage }
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to filter products'
      });
    }
  },

  // Compare products
  compareProducts: async (req, res) => {
    try {
      const { productIds } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 product IDs are required for comparison'
        });
      }

      const result = await query(productQueries.getProductsByIds, [productIds]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error comparing products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare products'
      });
    }
  },

  // Get all brands
  getBrands: async (req, res) => {
    try {
      const result = await query(productQueries.getBrands);
      
      res.json({
        success: true,
        data: result.rows.map(row => row.brand)
      });
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brands'
      });
    }
  }
};

module.exports = productController;