const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    // Basic regex, consider a more robust one or library like validator.js
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Do not return password by default
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- Middleware ---

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// --- Methods ---

// Instance method to compare candidate password with user password
userSchema.methods.comparePassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to create email verification token (simple implementation)
userSchema.methods.createEmailVerificationToken = function() {
  // Generate a simple 5-digit code
  const verificationToken = Math.floor(10000 + Math.random() * 90000).toString();

  // Store the non-hashed token (or hash it for better security)
  this.emailVerificationToken = verificationToken; // Consider hashing: crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Set expiration time (e.g., 10 minutes)
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken; // Return the plain token to send via email
};


const User = mongoose.model('User', userSchema);

module.exports = User; 