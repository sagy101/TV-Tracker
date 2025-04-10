const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Attempting to connect to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGODB_URI);

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tv-tracker', {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.name);
    console.log('Database host:', mongoose.connection.host);
    console.log('Database port:', mongoose.connection.port);

    // Monitor MongoDB connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code
    });
    process.exit(1);
  }
};

module.exports = connectDB; 