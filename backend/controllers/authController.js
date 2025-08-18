const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const authQueries = require('../queries/authQueries');

const JWT_SECRET = process.env.JWT_SECRET || 'As79fdkjfda';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authController = {
  // Login user
  // login: async (req, res) => {
  //   try {
  //     const { username, password } = req.body;

  //     if (!username || !password) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'Username and password are required'
  //       });
  //     }

  //     // Check for predefined admin credentials
  //     if (username === 'admin' && password === '1234') {
  //       const token = jwt.sign(
  //         { 
  //           id: 'admin-id',
  //           username: 'admin',
  //           role: 'admin'
  //         },
  //         JWT_SECRET,
  //         { expiresIn: JWT_EXPIRES_IN }
  //       );

  //       return res.json({
  //         success: true,
  //         data: {
  //           user: {
  //             id: 'admin-id',
  //             username: 'admin',
  //             role: 'admin'
  //           },
  //           token
  //         }
  //       });
  //     }

  //     // For any other username/password, create a regular user
  //     if (username && password) {
  //       const token = jwt.sign(
  //         { 
  //           id: `user-${Date.now()}`,
  //           username,
  //           role: 'user'
  //         },
  //         JWT_SECRET,
  //         { expiresIn: JWT_EXPIRES_IN }
  //       );

  //       return res.json({
  //         success: true,
  //         data: {
  //           user: {
  //             id: `user-${Date.now()}`,
  //             username,
  //             role: 'user'
  //           },
  //           token
  //         }
  //       });
  //     }

  //     res.status(401).json({
  //       success: false,
  //       error: 'Invalid credentials'
  //     });

  //   } catch (error) {
  //     console.error('Login error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'Login failed'
  //     });
  //   }
  // },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
      }

      const result = await query('SELECT * FROM users WHERE username = $1', [username]);
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        data: {
          user: { id: user.id, username: user.username, role: user.role },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  },


  // Logout user
  logout: async (req, res) => {
    try {
      // In a real app, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      // Token is already verified by middleware
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Token verification failed'
      });
    }
  },

  // Register user (for future use)
  register: async (req, res) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user in database
      const result = await query(authQueries.createUser, [username, passwordHash, role]);
      const newUser = result.rows[0];

      // Generate token
      const token = jwt.sign(
        { 
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }
};

module.exports = authController;