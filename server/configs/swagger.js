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
                url: 'https://jmmhotel.site',
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
    // Explicitly list all route files to ensure they're found on Vercel
    apis: [
        path.join(__dirname, '../routes/userRoutes.js'),
        path.join(__dirname, '../routes/hotelRoutes.js'),
        path.join(__dirname, '../routes/roomRoutes.js'),
        path.join(__dirname, '../routes/bookingRoutes.js'),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
