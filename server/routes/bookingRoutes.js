import express from 'express';
import {
    checkAvailabilityAPI,
    createBooking,
    getHotelBookings,
    getUserBookings,
    stripePayment,
    verifyPayment
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management API
 */

/**
 * @swagger
 * /api/bookings/check-availability:
 *   post:
 *     summary: Check room availability
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - checkInDate
 *               - checkOutDate
 *             properties:
 *               room:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Availability status
 */
bookingRouter.post('/check-availability', checkAvailabilityAPI);

/**
 * @swagger
 * /api/bookings/book:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - checkInDate
 *               - checkOutDate
 *               - guests
 *             properties:
 *               room:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               guests:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       401:
 *         description: Unauthorized
 */
bookingRouter.post('/book', protect, createBooking);

/**
 * @swagger
 * /api/bookings/user:
 *   get:
 *     summary: Get bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       401:
 *         description: Unauthorized
 */
bookingRouter.get('/user', protect, getUserBookings);

/**
 * @swagger
 * /api/bookings/hotel:
 *   get:
 *     summary: Get bookings for the logged-in hotel owner
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of hotel bookings
 *       401:
 *         description: Unauthorized
 */
bookingRouter.get('/hotel', protect, getHotelBookings);

/**
 * @swagger
 * /api/bookings/stripe-payment:
 *   post:
 *     summary: Create Stripe payment session
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment session created
 *       401:
 *         description: Unauthorized
 */
bookingRouter.post('/stripe-payment', protect, stripePayment);

/**
 * @swagger
 * /api/bookings/verify-payment:
 *   post:
 *     summary: Verify Stripe payment
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 *       401:
 *         description: Unauthorized
 */
bookingRouter.post('/verify-payment', protect, verifyPayment);

// Note: Webhook endpoint is handled directly in server.js before JSON parsing

export default bookingRouter;
