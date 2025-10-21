import express, { response } from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhook from "./controllers/ClerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

connectDB();
connectCloudinary();

const app = express();

// ✅ CORS CHUẨN CHO VERCEL + CLERK + RENDER
app.set('trust proxy', 1);
app.use(cors({
  origin: [
    "http://localhost:5173",                 // Local Development
    "https://be-hotel-booking.vercel.app"    // Deployed FE on Vercel
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

// Clerk middleware (KHÔNG được đặt trước cors)
app.use(express.json());
app.use(clerkMiddleware());

// api to listen to clerk webhook
app.use("/api/clerk", clerkWebhook);

// Test root API
app.get('/', (req, res) => res.send("API is working"));

// API routes
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
