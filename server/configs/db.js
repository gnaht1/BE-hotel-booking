import mongoose from "mongoose";
import "dotenv/config";

let isConnected = false; // Track connection status

const connectDB = async () => {
    // If already connected, reuse the connection
    if (isConnected && mongoose.connection.readyState === 1) {
        console.log("Using existing database connection");
        return;
    }

    // If connection is in progress, wait for it
    if (mongoose.connection.readyState === 2) {
        console.log("Database connection in progress, waiting...");
        await new Promise((resolve) => {
            mongoose.connection.once('connected', resolve);
        });
        isConnected = true;
        return;
    }

    try {
        // Configure Mongoose for serverless environment
        mongoose.set('strictQuery', false);
        mongoose.set('bufferCommands', false); // Disable buffering to get immediate errors
        
        const db = await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 2, // Maintain at least 2 connections
        });

        isConnected = db.connections[0].readyState === 1;
        console.log("✅ MongoDB connected successfully");
        
        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.log("❌ MongoDB disconnected");
            isConnected = false;
        });
        
        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB connection error:", err);
            isConnected = false;
        });
        
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        isConnected = false;
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

export default connectDB;