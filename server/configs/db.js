import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    // If already connected, reuse the connection
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        // Configure Mongoose for serverless
        mongoose.set('bufferCommands', false); // Disable buffering
        mongoose.set('bufferTimeoutMS', 30000); // Increase buffer timeout to 30s
        
        const db = await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s default
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
        });

        isConnected = db.connections[0].readyState === 1;
        console.log("DB is connected");
    } catch (error) {
        console.error("Database connection error:", error.message);
        throw error;
    }
}

export default connectDB;