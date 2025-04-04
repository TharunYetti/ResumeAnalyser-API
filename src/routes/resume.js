const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
// Configure Multer to store files
const upload=multer();

const ResumeController = require("../controllers/ResumeController");

router.post("/analyse", upload.single("resume"), authMiddleware, ResumeController.analyse);

// Get statistics data
router.get('/stats', ResumeController.stats);

// GET all resumes
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find()
      .populate("userId", "firstName lastName emailId") // Correct field names
      .exec();

    const formattedResumes = resumes.map((resume) => ({
      id: resume._id,
      userName: resume.userId
        ? `${resume.userId.firstName} ${resume.userId.lastName}`
        : "Unknown User",
      userEmail: resume.userId?.emailId || "No Email", // Use emailId
      score: resume.score,
      readabilityScore: resume.readabilityScore,
      atsFriendly: resume.atsFriendly,
      file: resume.file ? resume.file.toString("base64") : null,
    }));

    res.json({ resumes: formattedResumes });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ error: "Error fetching resumes" });
  }
});


module.exports = router;