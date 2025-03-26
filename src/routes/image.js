const express = require("express");
const multer = require("multer");
const Resume = require("../models/Resume");
const User = require("../models/User");
const { analyzeImage } = require("../utils/imageAnalyzer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
// Configure Multer to store files in memory (not in a folder)
const storage = multer.memoryStorage(); // Store file in RAM instead of disk
const upload = multer({ storage: storage });


router.post("/scraper", upload.single("image"), authMiddleware, async (req, res) => {
    console.log("Request received at /image/scraper"); // Debugging
  try {
    const { userId } = req.user; // Extract from token middleware
    console.log("userId",userId);
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ error: "No image uploaded" });

    // Extract mimetype and file buffer
    const mimeType = imageFile.mimetype;  // Example: "application/pdf"
    const fileBuffer = imageFile.buffer;  // File data in memory
    console.log(mimeType, fileBuffer);
    // Analyze Image
    const result = await analyzeImage(fileBuffer, mimeType);

    // console.log("Type of result:", typeof result);
    // console.log("Full result:", result);

    // console.log(result.analysis);

  res.json({ message: "Image Scraped successfully", data: result });
  } catch (error) {
    res.status(500).json({ error: "Error analyzing resume" });
  }
});

module.exports = router;