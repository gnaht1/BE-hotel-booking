import express, { response } from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhook from "./controllers/ClerkWebhooks.js";


connectDB();

const app = express();
app.use(cors()); // Enable CORS for all routes

// Clerk middleware
app.use(express.json());
app.use(clerkMiddleware())

// api to listen to clerk webhook
app.use("/api/clerk", clerkWebhook);

app.get('/', (req, res) => res.send("API is working"));   

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));