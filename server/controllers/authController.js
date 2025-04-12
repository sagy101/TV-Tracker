const User = require('../../models/User'); // Adjust path as needed
const sendEmail = require('../utils/email'); // Import email utility
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const bcrypt = require('bcryptjs'); // Import bcryptjs
// TODO: Add error handling utility

// Helper function to sign JWT
const signToken = (id) => {
  // Ensure JWT_SECRET and JWT_EXPIRES_IN are set in your .env file
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d' // Default to 90 days
  });
};

exports.sendVerification = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: 'Email is already registered and verified.' });
    }

    // Determine if we're updating an existing (unverified) user or creating a temporary record
    let user = existingUser;
    let isNewUser = false;
    if (!user) {
      // Create a temporary user record for verification purposes
      // We don't set a password yet. User is fully created/updated upon signup.
      user = new User({ email });
      isNewUser = true;
      // Note: Consider a separate collection/mechanism for pending verifications
      // to avoid cluttering the main Users collection if signup isn't completed.
    }

    // Generate and save verification token using the model method
    const verificationToken = user.createEmailVerificationToken();
    // Save the user (either new temporary or existing unverified with new token)
    // Skip password validation for temporary user creation
    await user.save({ validateBeforeSave: !isNewUser });

    // Prepare email content
    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}&email=${email}`; // Example URL, adjust as needed
    const message = `Welcome to TrackTV! Your verification code is: ${verificationToken}\n\nThis code will expire in 10 minutes.\n\nAlternatively, you can verify by visiting: ${verificationUrl}\n\nIf you didn't request this, please ignore this email.`;

    // Send the email
    await sendEmail({
      email: user.email,
      subject: 'TrackTV - Verify Your Email',
      message,
    });

    res.status(200).json({ message: 'Verification code sent to your email.' });

  } catch (error) {
    console.error('Error in sendVerification:', error);
    // Clear sensitive info if potentially saved to user before sending response
    // (e.g., if token saving failed after generation)
    // Consider more robust error handling/transaction logic

    // Check if the error came from sendEmail utility
    if (error.message.includes('error sending the email')) {
        // Potentially try to revert user save or mark email sending failed?
        return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    // Handle other potential errors (e.g., database error)
    res.status(500).json({ message: 'An error occurred during the verification process.' });
  }
};

exports.verifyEmail = async (req, res, next) => {
  // 1. Get email and token from request body
  // 2. Find user by email
  // 3. Check if token matches and hasn't expired
  // 4. If valid, mark email as verified and clear token fields
  console.log('verifyEmail controller called');
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  try {
    // Find the user by email and the NON-HASHED token
    // IMPORTANT: If you hash tokens, you need to query differently
    const user = await User.findOne({
        email,
        emailVerificationToken: verificationCode,
        emailVerificationExpires: { $gt: Date.now() } // Check if token is still valid
    });

    if (!user) {
        // Provide slightly more specific feedback without revealing too much
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.emailVerified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }
        if (existingUser && existingUser.emailVerificationToken !== verificationCode) {
             return res.status(400).json({ message: 'Invalid verification code.' });
        }
        if (existingUser && existingUser.emailVerificationExpires <= Date.now()) {
            return res.status(400).json({ message: 'Verification code expired.'});
        }
        // Generic if user not found at all
        return res.status(400).json({ message: 'Verification failed. Please request a new code.' });
    }

    // Mark email as verified and clear verification fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false }); // Save changes, skip validation that might require password

    res.status(200).json({ message: 'Email verified successfully.' });

  } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Error verifying email.' });
  }

};

exports.signup = async (req, res, next) => {
  console.log('signup controller called');
  const { email, password, confirmPassword } = req.body;

  // Basic validation
  if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email, password, and confirmation are required.'});
  }
  if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).json({ message: 'User not found. Please complete email verification first.' });
      }

      if (!user.emailVerified) {
          return res.status(400).json({ message: 'Email not verified. Please complete email verification first.' });
      }

      // Update user with password
      user.password = password;
      await user.save(); // Hash is handled by pre-save middleware

      // Generate JWT Token
      const token = signToken(user._id);

      // Send signup success email
      try {
          await sendEmail({
            email: user.email,
            subject: 'Welcome to TrackTV!',
            message: `Hi ${user.email},\n\nWelcome to TrackTV! Your account has been successfully created.\n\nYou can now log in and start tracking your favorite shows.\n\nEnjoy!`,
          });
      } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
      }

      // Prepare user object for response
      const userResponse = {
           id: user._id,
           email: user.email,
      };

      // TODO: Set cookie with JWT? Or just send in response body?
      // Sending in body for now, client needs to store it.

      res.status(201).json({
          message: 'User signed up successfully.',
          token,
          user: userResponse
      });

  } catch (error) {
      console.error('Error during signup:', error);
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(el => el.message);
          const message = `Invalid input data: ${messages.join('. ')}`;
          return res.status(400).json({ message });
      }
      if (error.code === 11000) {
          return res.status(400).json({ message: 'Email already exists.'});
      }
      res.status(500).json({ message: 'Error signing up user.' });
  }
};

// --- Login Controller ---
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // 2. Check if user exists && password is correct
    // Need to explicitly select the password field as it's select: false in the model
    const user = await User.findOne({ email }).select('+password');

    // Use the comparePassword method from the User model
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // 3. Check if user email is verified (optional, but good practice)
    if (!user.emailVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
        // Optionally, trigger resend verification logic here?
    }

    // 4. If everything ok, send token to client
    const token = signToken(user._id);

    // Prepare user object for response (exclude password)
    const userResponse = {
       id: user._id,
       email: user.email,
       // Add other relevant non-sensitive fields
    };

    res.status(200).json({
      status: 'success',
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};