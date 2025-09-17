// API Configuration
export const API_CONFIG = {
  // Backend API Base URL
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/auth',
  
  // Python ML API Base URL
  ML_API_URL: process.env.REACT_APP_ML_API_URL || 'http://localhost:5000/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Product endpoints
    PRODUCTS: '/products',
    PRODUCT_BY_ID: '/products/:id',
    PRODUCT_SEARCH: '/products/search',
    PRODUCT_FILTER: '/products/filter',
    
    // Comparison endpoints
    COMPARE_PRODUCTS: '/compare',
    
    // ML Prediction endpoints
    PREDICT_PRICE: '/predict/price',
    
    // Admin endpoints
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_STATS: '/admin/stats',
    ADMIN_UPLOAD: '/admin/upload',
    ADMIN_RETRAIN: '/admin/retrain',
    
    // Auth endpoints
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify'
  },
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_URL: 'http://localhost:3001/api/auth',
    ML_API_URL: 'http://localhost:5000/api',
    DEBUG: true
  },
  production: {
    API_URL: 'https://your-api-domain.com/api/auth',
    ML_API_URL: 'https://your-ml-api-domain.com/api',
    DEBUG: false
  }
};

// Get current environment config
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
};