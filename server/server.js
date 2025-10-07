import express, { response } from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

connectDB();

const app = express();
app.use(cors()); // Enable CORS for all routes

app.get('/', (req, res) => res.send("API is working"));   

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));