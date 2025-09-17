const db = require('../config/database'); // Adjust path based on your db config

const getStats = async () => {
  try {
    // Assuming you have a 'users' table
    const userCountQuery = 'SELECT COUNT(*) as count FROM users';
    const productCountQuery = 'SELECT COUNT(*) as count FROM products';
    
    const [userResult] = await db.execute(userCountQuery);
    const [productResult] = await db.execute(productCountQuery);
    
    return {
      totalUsers: parseInt(userResult[0].count),
      totalProducts: parseInt(productResult[0].count)
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getStats
};