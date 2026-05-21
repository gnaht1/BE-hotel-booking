import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";    

const BOOKING_PAYMENT_HOLD_MS = 10 * 60 * 1000;

// Function to Check Availability of Room
const checkAvailability = async ({ checkInDate, checkOutDate, room })=>{
    try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (!room || Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return { success: false, message: "Invalid room or dates" };
        }

        if (checkOut <= checkIn) {
            return { success: false, message: "Check-out date must be after check-in date" };
        }

        const roomData = await Room.findById(room);
        if (!roomData || !roomData.isAvailable) {
            return { success: true, isAvailable: false };
        }

        const bookings = await Booking.find({
            room,
            status: { $ne: "cancelled" },
            checkInDate: {$lt: checkOut},
            checkOutDate: {$gt: checkIn},
        });
        const isAvailable = bookings.length === 0;
        return { success: true, isAvailable };
    } catch (error) {
        console.error(error.message);
        return { success: false, message: error.message };
    }
}
// API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) =>{
    try {
        const { room, roomId, checkInDate, checkOutDate } = req.body;
        const result = await checkAvailability({ checkInDate, checkOutDate, room: room || roomId });
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json({ success: true, isAvailable: result.isAvailable, available: result.isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) =>{
    try {
        const { room, roomId, checkInDate, checkOutDate, guests } = req.body;
        const selectedRoom = room || roomId;
        const user = req.user._id;

        // Before Booking Check Availability
        const availability = await checkAvailability({
            checkInDate,
            checkOutDate,
            room: selectedRoom
        });

        if(!availability.success){
            return res.status(400).json({success: false, message: availability.message});
        }

        if(!availability.isAvailable){
            return res.json({success: false, message: "Room is not available"});
        }
        // Get totalPrice from Room
        const roomData = await Room.findById(selectedRoom).populate("hotel");
        if (!roomData) {
            return res.status(404).json({success: false, message: "Room not found"});
        }
        let totalPrice = roomData.pricePerNight;

        // Calculate totalPrice based on nights
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;

        const booking = await Booking.create({
            user,
            room: selectedRoom,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })
const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: req.user.email,
    subject: 'Hotel Booking Details',
    html: `
    <h2>Your Booking Details</h2>
    <p>Dear ${req.user.username},</p>
    <p>Thank you for your booking! Here are your details:</p>
    <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
        <li><strong>Location:</strong> ${roomData.hotel.address}</li>
        <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
        <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice} /night</li>
    </ul>
    `
}

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error("Booking confirmation email failed:", mailError.message);
        }

        res.json({
            success: true,
            message: "Booking created successfully",
            booking,
            bookingId: booking._id,
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create booking" })
    }
};

// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) =>{
    try {
        if (!req.user) {
            return res.status(401).json({success: false, message: "User not authenticated"});
        }
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate("room hotel").sort({createdAt: -1});
        res.json({success: true, bookings})
    } catch (error) {
        console.error("Get user bookings error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch bookings: " + error.message });
    }
}

export const getHotelBookings = async (req, res) =>{
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if(!hotel){
            return res.json({ success: false, message: "No Hotel found" });
        }

        const bookings = await Booking.find({ hotel: hotel._id })
            .populate("room hotel user")
            .sort({ createdAt: -1 });

        // Total Bookings
        const totalBookings = bookings.length;

        // Total Revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
};

export const stripePayment = async (req, res) =>{
    try {
        const {bookingId} = req.body;

        const booking = await Booking.findById(bookingId);  
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized booking" });
        }

        if (booking.isPaid) {
            return res.json({ success: false, message: "Booking is already paid" });
        }

        const roomData = await Room.findById(booking.room).populate("hotel");
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
        const totalPrice = booking.totalPrice;
        const {origin} = req.headers;

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100,
                },
                quantity: 1,
                
            }
        ]

        // Create Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId,
            }
        })
        res.json({ success: true, url: session.url });
    }
    catch (error) {
        console.error("Stripe payment error:", error);
        res.status(500).json({ success: false, message: "Failed payment: " + error.message });
    }
}

export const createPaymentIntent = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId).populate("room hotel");
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized booking" });
        }

        if (booking.isPaid) {
            return res.json({ success: false, message: "Booking is already paid" });
        }

        if (Date.now() - booking.createdAt.getTime() > BOOKING_PAYMENT_HOLD_MS) {
            await Booking.findByIdAndDelete(booking._id);
            return res.status(410).json({ success: false, message: "Booking payment window expired" });
        }

        if (!booking.totalPrice || booking.totalPrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid booking amount" });
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const amount = Math.round(booking.totalPrice * 100);
        const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: booking._id.toString(),
                userId: req.user._id.toString(),
                source: "mobile",
            },
            description: `Hotel booking ${booking._id}`,
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            bookingId: booking._id,
            amount,
            currency,
        });
    } catch (error) {
        console.error("Create payment intent error:", error);
        res.status(500).json({ success: false, message: "Failed to create payment intent: " + error.message });
    }
}

export const deleteUnpaidBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: true, message: "Booking already removed" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized booking" });
        }

        if (booking.isPaid) {
            return res.status(400).json({ success: false, message: "Paid bookings cannot be deleted" });
        }

        await Booking.findByIdAndDelete(bookingId);
        res.json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Delete unpaid booking error:", error);
        res.status(500).json({ success: false, message: "Failed to delete booking: " + error.message });
    }
}

// API to verify Stripe payment and update booking
// POST /api/bookings/verify-payment
export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID is required" });
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        
        // Retrieve the session from Stripe
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const bookingId = session.metadata.bookingId;
            
            // Update booking payment status and payment method
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                { 
                    isPaid: true,
                    paymentMethod: 'Stripe'
                },
                { new: true }
            );

            if (!booking) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            console.log(`Booking ${bookingId} marked as paid via Stripe`);
            return res.json({ success: true, message: "Payment verified successfully", booking });
        } else {
            return res.json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ success: false, message: "Failed to verify payment: " + error.message });
    }
}

export const verifyPaymentIntent = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: "PaymentIntent ID is required" });
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
        const bookingId = paymentIntent.metadata?.bookingId;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "PaymentIntent is missing booking metadata" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized booking" });
        }

        if (paymentIntent.status !== "succeeded") {
            return res.json({
                success: false,
                message: `Payment not completed. Status: ${paymentIntent.status}`,
                status: paymentIntent.status,
            });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                isPaid: true,
                paymentMethod: "Stripe",
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Payment verified successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Verify payment intent error:", error);
        res.status(500).json({ success: false, message: "Failed to verify payment intent: " + error.message });
    }
}
