import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("DB is connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;