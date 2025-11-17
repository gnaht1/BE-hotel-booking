import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// Middleware to check if user is authenticated
export const protect = async(req,res, next) =>{
    try {
        const {userId} = req.auth;
        if (!userId) {
            return res.status(401).json({success: false, message: "Unauthorized - No user ID provided"});
        }
        
        let user = await User.findById(userId);
        
        // If user doesn't exist in database but has valid Clerk token, create them
        if (!user) {
            console.log(`User ${userId} not found in database. Fetching from Clerk and creating...`);
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                
                const userData = {
                    _id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    username: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.emailAddresses[0].emailAddress,
                    image: clerkUser.imageUrl || '',
                    role: "user",
                    recentSearchCities: [],
                };
                
                user = await User.create(userData);
                console.log(`User ${userId} created successfully from Clerk data`);
            } catch (clerkError) {
                console.error("Error fetching user from Clerk:", clerkError);
                return res.status(404).json({success: false, message: "User not found in database or Clerk"});
            }
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({success: false, message: "Authentication error: " + error.message});
    }
}