// ML Prediction-related SQL queries

const predictionQueries = {
  // Save prediction result
  savePrediction: `
    INSERT INTO predictions (
      user_id,
      brand,
      display_size,
      processor,
      ram,
      storage,
      camera,
      battery,
      predicted_price,
      confidence_score,
      model_version
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, predicted_price, confidence_score, created_at
  `,

  // Get user predictions
  getUserPredictions: `
    SELECT 
      id,
      brand,
      display_size,
      processor,
      ram,
      storage,
      camera,
      battery,
      predicted_price,
      confidence_score,
      model_version,
      created_at
    FROM predictions 
    WHERE user_id = $1 
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `,

  // Get all predictions (admin)
  getAllPredictions: `
    SELECT 
      p.id,
      u.username,
      p.brand,
      p.display_size,
      p.processor,
      p.ram,
      p.storage,
      p.camera,
      p.battery,
      p.predicted_price,
      p.confidence_score,
      p.model_version,
      p.created_at
    FROM predictions p
    LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `,

  // Get prediction statistics
  getPredictionStats: `
    SELECT 
      COUNT(*) as total_predictions,
      AVG(predicted_price) as avg_predicted_price,
      AVG(confidence_score) as avg_confidence,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT brand) as unique_brands
    FROM predictions
  `,

  // Get training data for ML model
  getTrainingData: `
    SELECT 
      p.brand,
      ps.display_size,
      ps.processor,
      ps.ram,
      ps.storage,
      ps.camera,
      ps.battery,
      ps.operating_system,
      p.price as actual_price
    FROM products p
    JOIN product_specs ps ON p.id = ps.product_id
    WHERE p.price IS NOT NULL
  `
};

module.exports = predictionQueries;