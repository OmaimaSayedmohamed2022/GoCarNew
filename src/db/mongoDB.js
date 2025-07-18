import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from '../utils/config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.dbURL); 
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

