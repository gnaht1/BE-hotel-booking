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

const app = express();

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({ 
            success: false, 
            message: "Database connection failed" 
        });
    }
});

// Initialize connections on startup (but don't block)
connectDB().catch(console.error);

connectCloudinary();

app.use(cors()); // Enable CORS for all routes

// Stripe webhook needs raw body - must come before express.json()
app.post('/api/bookings/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Clerk middleware
app.use(express.json());
app.use(clerkMiddleware())

// api to listen to clerk webhook
app.use("/api/clerk", clerkWebhook);

app.get('/', (req, res) => res.send("API is working"));
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));