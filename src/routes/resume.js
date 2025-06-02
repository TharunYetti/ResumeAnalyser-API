const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Resume = require("../models/Resume");

const router = express.Router();
const upload = multer();
const ResumeController = require("../controllers/ResumeController");

/**
 * @swagger
 * /resume/analyse:
 *   post:
 *     summary: Upload and analyze a resume
 *     description: Upload a resume file along with an optional job description to analyze the resume, extract information, and return an analysis report.
 *     tags:
 *       - Resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               jobDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resume uploaded, analyzed, and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resume uploaded, analyzed, and stored successfully
 *                 resume:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     file:
 *                       type: string
 *                       format: uri
 *                     extractedText:
 *                       type: string
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                         missingKeywords:
 *                           type: array
 *                           items:
 *                             type: string
 *                         suggestedJobs:
 *                           type: array
 *                           items:
 *                             type: string
 *                         readabilityScore:
 *                           type: integer
 *                         grammarIssues:
 *                           type: string
 *                         atsFriendly:
 *                           type: string
 *                         detailedDescription:
 *                           type: string
 *                         sectionWiseScore:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *                     score:
 *                       type: integer
 *                     missingKeywords:
 *                       type: array
 *                       items:
 *                         type: string
 *                     suggestedJobs:
 *                       type: array
 *                       items:
 *                         type: string
 *                     readabilityScore:
 *                       type: integer
 *                     atsFriendly:
 *                       type: string
 *                     _id:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: integer
 *                 sectionScores:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/analyse",
  upload.single("resume"),
  authMiddleware,
  ResumeController.analyse
);

/**
 * @swagger
 * /resume/stats:
 *   get:
 *     summary: Get statistics of resumes
 *     tags: [Resume]
 *     responses:
 *       200:
 *         description: Resume statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResumes:
 *                   type: integer
 *                   example: 72
 *                 scoreDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: integer
 *                         example: 8
 *                       count:
 *                         type: integer
 *                         example: 45
 *                 readabilityDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: Low
 *                       count:
 *                         type: integer
 *                         example: 70
 *                 atsFriendlyCount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "false"
 *                       count:
 *                         type: integer
 *                         example: 70
 *                 topMissingKeywords:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: Agile
 *                       count:
 *                         type: integer
 *                         example: 33
 *                 topGrammarIssues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: Minor grammatical errors and inconsistencies are present. Needs proofreading.
 *                       count:
 *                         type: integer
 *                         example: 1
 *       500:
 *         description: Server error
 */

router.get("/stats", ResumeController.stats);

/**
 * @swagger
 * /resume/all:
 *   get:
 *     summary: Get all non-admin users with their last two resume links
 *     tags: [Resume]
 *     responses:
 *       200:
 *         description: List of users and their resume links
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   lastTwoResumeLinks:
 *                     type: array
 *                     items:
 *                       type: string
 *                       description: URL or file path of resume
 *       500:
 *         description: Server error
 */
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().populate({
      path: "resumes",
      select: "file createdAt",
      options: { sort: { createdAt: -1 } },
    });

    const userData = users
      .filter((user) => user.role !== "admin")
      .map((user) => ({
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailId,
        lastTwoResumeLinks: user.resumes.slice(0, 2).map((r) => r.file),
      }));

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching users and resumes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
