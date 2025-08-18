// Authentication-related SQL queries

const authQueries = {
  // Get user by username
  getUserByUsername: `
    SELECT 
      id,
      username,
      password_hash,
      role,
      created_at,
      updated_at,
      last_login
    FROM users 
    WHERE username = $1
  `,

  // Create new user
  createUser: `
    INSERT INTO users (username, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, username, role, created_at
  `,

  // Update last login
  updateLastLogin: `
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = $1
  `,

  // Get user by ID
  getUserById: `
    SELECT 
      id,
      username,
      role,
      created_at,
      last_login
    FROM users 
    WHERE id = $1
  `,

  // Update user role
  updateUserRole: `
    UPDATE users 
    SET role = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
    RETURNING id, username, role
  `
};

module.exports = authQueries;