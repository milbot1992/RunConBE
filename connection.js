const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
const ENV = process.env.NODE_ENV || 'production';

dotenv.config({
  path: `${__dirname}/.env.${ENV}`
});

// Check if the MONGODB_URI environment variable is set
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI not set');
}

// Connect to MongoDB
console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Configuration for different environments
const config = {};

if (ENV === 'production') {
  config.connectionString = process.env.MONGODB_URI;
}

module.exports = {
  db: mongoose.connection,
  config,
};
