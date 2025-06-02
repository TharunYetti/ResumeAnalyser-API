const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

const UserController = require("../controllers/UserController");

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "682eded8d9537352a0e31291"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     emailId:
 *                       type: string
 *                       format: email
 *                       example: "johnx@example.com"
 *                     password:
 *                       type: string
 *                       example: "$2b$10$LnyooNMcrrvPiCNX6AakPe7zLrM//2YNjL/Vlpez6ZEOp5KjwyC06"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     resumes:
 *                       type: array
 *                       items: {}
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T08:22:48.898Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T08:22:48.898Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                 lastTwoResumes:
 *                   type: array
 *                   items: {}
 *                   example: []
 *       401:
 *         description: Unauthorized
 */

router.get("/profile", authMiddleware, UserController.profile);

/**
 * @swagger
 * /user/update-profile:
 *   put:
 *     summary: Update logged-in user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               emailId:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "682eded8d9537352a0e31291"
 *                     firstName:
 *                       type: string
 *                       example: "ram"
 *                     lastName:
 *                       type: string
 *                       example: "ram"
 *                     emailId:
 *                       type: string
 *                       format: email
 *                       example: "johnx@example.com"
 *                     password:
 *                       type: string
 *                       example: "$2b$10$LnyooNMcrrvPiCNX6AakPe7zLrM//2YNjL/Vlpez6ZEOp5KjwyC06"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     resumes:
 *                       type: array
 *                       items: {}
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T08:22:48.898Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T08:28:45.168Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       401:
 *         description: Unauthorized
 */

router.put("/update-profile", authMiddleware, UserController.updateProfile);

/**
 * @swagger
 * /user/verify-token:
 *   get:
 *     summary: Verify JWT token
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "682eded8d9537352a0e31291"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "johnx@example.com"
 *                 iat:
 *                   type: integer
 *                   description: Issued At (timestamp)
 *                   example: 1747902213
 *                 exp:
 *                   type: integer
 *                   description: Expiration (timestamp)
 *                   example: 1747988613
 *       401:
 *         description: Unauthorized - Invalid or expired token
 */

router.get("/verify-token", async (req, res) => {
  console.log("Verifying the token");
  const token = req.header("Authorization")?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "RESUME@123");
    console.log(decoded);
    res.status(200).json(decoded);
  } catch (error) {
    res.status(401).json("Invalid or expired token");
  }
});

module.exports = router;
