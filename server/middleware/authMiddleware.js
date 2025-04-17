const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token and attaches the user to the request object
 */
exports.protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4. Check if user is verified
    if (!currentUser.emailVerified) {
      return res.status(401).json({
        message: 'Please verify your email to access this resource.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your token has expired. Please log in again.'
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Something went wrong with authentication.'
    });
  }
};

/**
 * Optional middleware that will attach the user to the request if a valid token exists,
 * but won't block the request if no token or invalid token is provided
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, just continue without attaching user
    if (!token) {
      return next();
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // ATTACH USER TO REQUEST OBJECT
    req.user = currentUser;
    next();
  } catch (error) {
    // If any error occurs during verification, just continue without attaching user
    next();
  }
}; 