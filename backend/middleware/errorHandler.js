const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    error: 'Internal server error'
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.error = 'Invalid ID format';
    return res.status(400).json(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.error = 'Duplicate field value entered';
    return res.status(400).json(error);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error.error = message.join(', ');
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token expired';
    return res.status(401).json(error);
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    error.error = 'Duplicate entry';
    return res.status(409).json(error);
  }

  if (err.code === '23503') {
    error.error = 'Foreign key constraint violation';
    return res.status(400).json(error);
  }

  if (err.code === '23502') {
    error.error = 'Required field missing';
    return res.status(400).json(error);
  }

  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;