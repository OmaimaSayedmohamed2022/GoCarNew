// export default {
//     port: process.env.PORT || 6000,
//     env: process.env.NODE_ENV || 'development',
//     mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name',
//     jwtSecret: process.env.JWT_SECRET || process.env.JWT_SECRET,
//   };



const config = {
  dbURL: 'mongodb://127.0.0.1:27017/goCarLocalDB',
  port: 3000,
};

export default config;