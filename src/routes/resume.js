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



module.exports = router;