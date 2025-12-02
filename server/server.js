import express, { response } from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhook from "./controllers/ClerkWebhooks.js";
import stripeWebhook from "./controllers/stripeWebhook.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./configs/swagger.js";

// Initialize connections early (for serverless, this caches the connection)
connectDB().catch(err => console.error("Initial DB connection error:", err));
connectCloudinary();

const app = express();

// CORS configuration - allow both www and non-www domains
const allowedOrigins = [
    'https://jmmhotel.site',
    'https://www.jmmhotel.site',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in production for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Stripe webhook needs raw body - must come before express.json()
app.post('/api/bookings/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Clerk middleware
app.use(express.json());
app.use(clerkMiddleware())

// Lightweight DB connection middleware - ensure connection is ready
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(503).json({ 
            success: false, 
            message: "Database connection failed. Please try again." 
        });
    }
});

// api to listen to clerk webhook
app.use("/api/clerk", clerkWebhook);

app.get('/', (req, res) => res.send("API is working"));
app.get('/api', (req, res) => res.json({ message: "Hotel Booking API v1.0", status: "running" }));
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

// Export for Vercel serverless
export default app;