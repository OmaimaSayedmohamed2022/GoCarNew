import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GoCar API',
      version: '1.0.0',
      description: 'API documentation for GoCar app',
    },
    servers: [
      {
        url: 'http://localhost:6000', 
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

