import User from "../models/User.js";
// Get /api/user
export const getUserData = async(req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({success: false, message: "User not authenticated"});
        }
        const role = req.user.role;
        const recentSearchCities = req.user.recentSearchCities || [];
        res.json({success: true, role, recentSearchCities});
    } catch (error) {
        console.error("Get user data error:", error);
        res.status(500).json({success: false, message: error.message}); 
    }
}

// Stored user recent search cities 
export const storeRecentSearchCities = async(req, res) => {  
    try {
        const {recentSearchCity} = req.body;
        const user = req.user;

        if(!recentSearchCity){
            return res.status(400).json({success: false, message: "recentSearchCity is required"});
        }

        if (!user.recentSearchCities) {
            user.recentSearchCities = [];
        }

        user.recentSearchCities = user.recentSearchCities.filter(city => city !== recentSearchCity);
        user.recentSearchCities.push(recentSearchCity);
        if (user.recentSearchCities.length > 3) {
            user.recentSearchCities = user.recentSearchCities.slice(-3);
        }

        await user.save();
        res.json({success: true, message: "Recent search cities stored"});
    } catch (error) {
        console.error("Store recent search cities error:", error);
        res.status(500).json({success: false, message: error.message}); 
    }
}