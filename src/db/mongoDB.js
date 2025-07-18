import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    // console.log('MONGO_URI:', process.env.MONGO_URI);
      await mongoose.connect(process.env.MONGO_URI, { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
        });
     
      logger.info('MongoDB connected successfully');
  } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1); 
  }
};


export default connectDB;
