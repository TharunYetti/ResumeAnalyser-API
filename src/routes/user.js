const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

const UserController = require("../controllers/UserController");

router.get("/profile",authMiddleware , UserController.profile);
  
router.put("/update-profile",authMiddleware , UserController.updateProfile);

module.exports = router;