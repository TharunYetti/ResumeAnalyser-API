const express = require("express");
const authRouter = express.Router();
const AuthController = require("../controllers/AuthController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related routes
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - emailId
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               emailId:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: mySecurePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User registered successfully
 *               data:
 *                 firstName: John
 *                 lastName: Doe
 *                 emailId: john@example.com
 *                 role: user
 *                 _id: 60e439eb45a3f8123456789a
 *                 createdAt: 2023-10-01T12:00:00Z
 *                 updatedAt: 2023-10-01T12:00:00Z
 *                 __v: 0
 *       400:
 *         description: Validation or registration error
 *         content:
 *           text/plain:
 *             example: "Error: Email already exists"
 */
authRouter.post("/signup", AuthController.signup);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailId
 *               - password
 *             properties:
 *               emailId:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 firstName: John
 *                 lastName: Doe
 *                 emailId: john@example.com
 *                 role: user
 *                 _id: 60e439eb45a3f8123456789a
 *                 createdAt: 2023-10-01T12:00:00Z
 *                 updatedAt: 2023-10-01T12:00:00Z
 *                 __v: 0
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
 *         content:
 *           text/plain:
 *             example: "Error: Invalid credentials"
 */
authRouter.post("/login", AuthController.login);

/**
 * @swagger
 * /googlelogin:
 *   post:
 *     summary: Login or signup using Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - emailId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               emailId:
 *                 type: string
 *                 example: jane.doe@gmail.com
 *     responses:
 *       200:
 *         description: Google login/signup successful
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 firstName: John
 *                 lastName: Doe
 *                 emailId: john@example.com
 *                 role: user
 *                 _id: 60e439eb45a3f8123456789a
 *                 createdAt: 2023-10-01T12:00:00Z
 *                 updatedAt: 2023-10-01T12:00:00Z
 *                 __v: 0
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       500:
 *         description: Server error during Google login
 *         content:
 *           application/json:
 *             example:
 *               message: Server error.
 */
authRouter.post("/googlelogin", AuthController.googlelogin);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout the user by clearing the token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.get("/logout", AuthController.logout);

module.exports = authRouter;
