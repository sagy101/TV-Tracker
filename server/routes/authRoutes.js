const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/send-verification
router.post('/send-verification', authController.sendVerification);

// POST /api/auth/verify-email
router.post('/verify-email', authController.verifyEmail);

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router; 