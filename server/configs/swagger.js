import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hotel Booking API',
            version: '1.0.0',
            description: 'API documentation for the Hotel Booking application',
        },
        servers: [
            {
                // Use a variable or hardcode the production URL
                url: 'https://be-hotel-booking-ruddy.vercel.app',
                description: 'Production server',
            },
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Use absolute paths to work on both local and Vercel
    apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
