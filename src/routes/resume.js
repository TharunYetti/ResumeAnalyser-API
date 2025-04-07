const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Resume = require("../models/Resume");

const router = express.Router();
// Configure Multer to store files
const upload=multer();

const ResumeController = require("../controllers/ResumeController");

router.post("/analyse", upload.single("resume"), authMiddleware, ResumeController.analyse);

// Get statistics data
router.get('/stats', ResumeController.stats);

// GET /all - Get all users with their last two resumes' links
router.get("/all", async (req, res) => {
  try {
    // Fetch all users and populate resumes
    const users = await User.find()
      .populate({
        path: "resumes",
        select: "file createdAt",
        options: { sort: { createdAt: -1 } }
      });

    // Map users to include only last two resume file links
    const userData = users
    .filter(user => user.role !== 'admin')
    .map(user => ({
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailId,
      lastTwoResumeLinks: user.resumes.slice(0, 2).map(r => r.file)
    }));

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching users and resumes:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;