const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require('jsonwebtoken');

const UserController = require("../controllers/UserController");

router.get("/profile",authMiddleware , UserController.profile);
  
router.put("/update-profile",authMiddleware , UserController.updateProfile);

router.get("/verify-token",async (req, res)=>{
    console.log("Verifying the token");
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token
    try {
        const decoded = jwt.verify(token, "RESUME@123")
        console.log(decoded);
        res.status(200).json(decoded);
    } catch (error) {
        res.status(200).json(null); // Token expired or invalid
    }
});

module.exports = router;