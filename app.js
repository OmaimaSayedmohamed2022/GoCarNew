import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './src/utils/config.js';
import logger from './src/utils/logger.js';
import connectDB from './src/db/mongoDB.js';
import routes from './src/routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/swagger/swagger.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  morgan('combined', {
    skip: (req, res) => config.env === 'development' && res.statusCode < 400,
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
connectDB();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
// Routes
app.use('/api', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;