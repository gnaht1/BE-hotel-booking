import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhook = async (req, res) => {
    try {
        // Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET); 

        // Get the headers from the request
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // Verify the headers
        await whook.verify(JSON.stringify(req.body), headers);

        // Get data from the request body
        const {data, type} = req.body;

        

        // Switch case for different types of events
        switch (type){
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    username: data.first_name + " " + data.last_name,
                    image: data.image_url,
                    role: "user",
                    recentSearchCities: [],
                }; 

                await User.create(userData);
                console.log(`User created: ${userData._id}`);
                break;
            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    username: data.first_name + " " + data.last_name,
                    image: data.image_url,
                }; 
            
                await User.findByIdAndUpdate(data.id, userData);
                console.log(`User updated: ${data.id}`);
                break;
            }
            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                console.log(`User deleted: ${data.id}`);
                break;
            default:
                console.log(`Unhandled webhook type: ${type}`);
                break;
        }
        res.json({success: true, message: "Webhook received"});

    } catch (error) {
        console.error("Clerk webhook error:", error);
        res.status(400).json({success: false, message: error.message});
    }
}

export default clerkWebhook;