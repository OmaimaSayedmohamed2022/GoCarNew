import app from './app.js';
import config from './src/utils/config.js';
import logger from './src/utils/logger.js';


// const { port} = config;

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});