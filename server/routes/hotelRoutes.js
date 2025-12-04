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
 *                 enum:
 *                   - An Giang
 *                   - Bà Rịa - Vũng Tàu
 *                   - Bắc Giang
 *                   - Bắc Kạn
 *                   - Bạc Liêu
 *                   - Bắc Ninh
 *                   - Bến Tre
 *                   - Bình Định
 *                   - Bình Dương
 *                   - Bình Phước
 *                   - Bình Thuận
 *                   - Cà Mau
 *                   - Cần Thơ
 *                   - Cao Bằng
 *                   - Đà Nẵng
 *                   - Đắk Lắk
 *                   - Đắk Nông
 *                   - Điện Biên
 *                   - Đồng Nai
 *                   - Đồng Tháp
 *                   - Gia Lai
 *                   - Hà Giang
 *                   - Hà Nam
 *                   - Hà Nội
 *                   - Hà Tĩnh
 *                   - Hải Dương
 *                   - Hải Phòng
 *                   - Hậu Giang
 *                   - Hòa Bình
 *                   - Hưng Yên
 *                   - Khánh Hòa
 *                   - Kiên Giang
 *                   - Kon Tum
 *                   - Lai Châu
 *                   - Lâm Đồng
 *                   - Lạng Sơn
 *                   - Lào Cai
 *                   - Long An
 *                   - Nam Định
 *                   - Nghệ An
 *                   - Ninh Bình
 *                   - Ninh Thuận
 *                   - Phú Thọ
 *                   - Phú Yên
 *                   - Quảng Bình
 *                   - Quảng Nam
 *                   - Quảng Ngãi
 *                   - Quảng Ninh
 *                   - Quảng Trị
 *                   - Sóc Trăng
 *                   - Sơn La
 *                   - Tây Ninh
 *                   - Thái Bình
 *                   - Thái Nguyên
 *                   - Thanh Hóa
 *                   - Thừa Thiên Huế
 *                   - Tiền Giang
 *                   - TP. Hồ Chí Minh
 *                   - Trà Vinh
 *                   - Tuyên Quang
 *                   - Vĩnh Long
 *                   - Vĩnh Phúc
 *                   - Yên Bái
 *     responses:
 *       200:
 *         description: Hotel registered successfully
 *       401:
 *         description: Unauthorized
 */
hotelRouter.post('/', protect, registerHotel);

export default hotelRouter;
