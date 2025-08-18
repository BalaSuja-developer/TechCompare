const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// const cors = require('cors');
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

// Authentication routes
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/register', authController.register);

module.exports = router;