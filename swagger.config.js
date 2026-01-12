/** @type {import('next-swagger-doc').SwaggerConfig} */
const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FH Wien Dashboard API',
      version: '1.0.0',
      description: 'API documentation for the FH Wien Dashboard application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apiFolder: 'app/api',
  schemaFolders: ['shared/lib'],
};

module.exports = swaggerConfig;

