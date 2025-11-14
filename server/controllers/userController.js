import User from "../models/User.js";
// Get /api/user
export const getUserData = async(req, res) => {
    try {
        const role = req.user.role;
        const recentSearchCities = req.user.recentSearchCities;
        res.json({success: true, role, recentSearchCities});
    } catch (error) {
        res.json({success: false, message: error.message}); 
        // console.log(error.message);
    }
}

// Stored user recent search cities 
export const storeRecentSearchCities = async(req, res) => {  
    try {
        const {recentSearchCity} = req.body;
        const user = await req.user;

        if(!recentSearchCity){
            return res.json({success: false, message: "recentSearchCity is required"});
        }

        user.recentSearchCities = user.recentSearchCities.filter(city => city !== recentSearchCity);
        user.recentSearchCities.push(recentSearchCity);
        if (user.recentSearchCities.length > 3) {
            user.recentSearchCities = user.recentSearchCities.slice(-3);
        }

        await user.save();
        res.json({success: true, message: "Recent search cities stored"});
    } catch (error) {
        res.json({success: false, message: error.message}); 
    }
}