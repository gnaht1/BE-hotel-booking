import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel management API
 */

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Register a new hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - contact
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hotel registered successfully
 *       401:
 *         description: Unauthorized
 */
hotelRouter.post('/', protect, registerHotel);

export default hotelRouter;
