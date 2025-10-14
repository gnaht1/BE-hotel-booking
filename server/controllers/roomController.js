import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// API to create a new room for a hotel
export const createRoom = async (req, res)=>{
    try {
        const {roomType, pricePerNight, amenities} = req.body;
        const hotel = await Hotel.findOne({owner: req.auth.userId})

        if(!hotel) return res.json({ success: false, message: "No Hotel found" });

        // Debug logging
        console.log('Files received:', req.files);
        console.log('Files length:', req.files ? req.files.length : 'undefined');

        // Check if files are uploaded
        if (!req.files || req.files.length === 0) {
            return res.json({ success: false, message: "At least one image is required" });
        }

        // upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            console.log('Uploading file:', file.originalname, 'Size:', file.size, 'Type:', file.mimetype);
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            console.log('Upload successful:', result.secure_url);
                            resolve(result.secure_url);
                        }
                    }
                ).end(file.buffer);
            });
        })
        // Wait for all uploads to complete
        const images = await Promise.all(uploadImages)
            await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images,
        })

        res.json({ success: true, message: "Room created successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// API to get all rooms
export const getRooms = async (req, res)=>{
    try {
        const rooms = await Room.find({isAvailable: true}).populate({
            path: 'hotel',
            populate:{
                path: 'owner',
                select: 'image'
            }
        }).sort({createdAt: -1})
        res.json({success: true, rooms});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}


// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res)=>{
    try {
        const hotelData = await Hotel.findOne({owner: req.auth.userId})
        const rooms = await Room.find({hotel: hotelData._id.toString()}).populate("hotel");
        res.json({success: true, rooms});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}


// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res)=>{
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability Updated" });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
