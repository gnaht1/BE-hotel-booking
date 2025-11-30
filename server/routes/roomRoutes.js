import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerRooms, getRooms, toggleRoomAvailability, updateRoom, deleteRoom } from "../controllers/roomController.js";

const roomRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management API
 */

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - roomType
 *               - pricePerNight
 *               - amenities
 *               - images
 *             properties:
 *               roomType:
 *                 type: string
 *               pricePerNight:
 *                 type: number
 *               amenities:
 *                 type: string
 *                 description: JSON string of amenities
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Room created successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all available rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of rooms
 */
roomRouter.post('/', (req, res, next) => {
    upload.array("images", 4)(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.json({ success: false, message: err.message });
        }
        next();
    });
}, protect, createRoom);
roomRouter.get('/', getRooms);

/**
 * @swagger
 * /api/rooms/owner:
 *   get:
 *     summary: Get rooms for the logged-in hotel owner
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owner's rooms
 *       401:
 *         description: Unauthorized
 */
roomRouter.get('/owner', protect, getOwnerRooms);

/**
 * @swagger
 * /api/rooms/toggle-availability:
 *   post:
 *     summary: Toggle room availability
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room availability updated
 *       401:
 *         description: Unauthorized
 */
roomRouter.post('/toggle-availability', protect, toggleRoomAvailability);

/**
 * @swagger
 * /api/rooms/{roomId}:
 *   put:
 *     summary: Update a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *               pricePerNight:
 *                 type: number
 *               amenities:
 *                 type: string
 *                 description: JSON string of amenities
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       401:
 *         description: Unauthorized
 */
roomRouter.put('/:roomId', (req, res, next) => {
    upload.array("images", 4)(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.json({ success: false, message: err.message });
        }
        next();
    });
}, protect, updateRoom);
roomRouter.delete('/:roomId', protect, deleteRoom);

export default roomRouter;
