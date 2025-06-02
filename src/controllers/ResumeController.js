const Resume = require("../models/Resume");
const User = require("../models/User");
const { analyzeResume } = require("../utils/resumeAnalyzer");
const uploadToDrive = require("../utils/googleDrive");

exports.analyse = async (req, res) => {
  console.log("Request received at /resume/analyze");
 
  try {
      const { userId } = req.user;
      console.log("userId:", userId);

      const resumeFile = req.file;
      if (!resumeFile) return res.status(400).json({ error: "No file uploaded" });

      const jobDescription = req.body.jobDescription;

      // ✅ Step 1: Analyze Resume
      console.log("Analyzing resume...");
      let result;
      try {
          result = await analyzeResume(resumeFile.buffer, resumeFile.mimetype, jobDescription);
          console.log("Analysis Result:", result);
      } catch (error) {
          console.error("Error in analyzeResume:", error);
          return res.status(500).json({ error: "Error analyzing resume" });
      }

      // ✅ Step 2: Upload to Google Drive
      console.log("Uploading to Google Drive...");
      let fileUrl;
      try {
          fileUrl = await uploadToDrive(resumeFile);
          console.log("File uploaded to Drive:", fileUrl);
      } catch (error) {
          console.error("Error in uploadToDrive:", error);
          return res.status(500).json({ error: "Error uploading file to Google Drive" });
      }

      // ✅ Step 3: Save to Database
      console.log("Saving to database...");
      const newResume = new Resume({
        userId,
        file: fileUrl, // Storing Drive link
        extractedText: result.resumeText,
        analysis: result, // store the whole analysis if needed
        score: result.score,
        missingKeywords: result.missingKeywords,
        suggestedJobs: result.suggestedJobs,
        readabilityScore: result.readabilityScore,
        grammarIssues: result.grammarIssues,
        atsFriendly: result.atsFriendly,
      });
      

      await newResume.save();
      console.log("Resume saved!");

      // ✅ Step 4: Update User's Resumes Array
      await User.findByIdAndUpdate(
          userId,
          { $push: { resumes: newResume._id } },
          { new: true }
      );

      res.json({
          message: "Resume uploaded, analyzed, and stored successfully",
          resume: newResume,
          sectionScores: result.sectionScores,
      });
  } catch (error) {
      console.error("Unhandled Error in /analyze:", error);
      res.status(500).json({ error: "Unexpected server error" });
  }
}

exports.stats = async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments();

    const scoreDistribution = await Resume.aggregate([
      {
        $group: {
          _id: { $ceil: { $divide: ["$score", 10] } }, // Group by score range (1-10, 11-20, etc.)
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const readabilityDistribution = await Resume.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $lte: ["$readabilityScore", 40] },
              then: "Low",
              else: {
                $cond: {
                  if: { $lte: ["$readabilityScore", 70] },
                  then: "Medium",
                  else: "High"
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    

    const atsFriendlyCount = await Resume.aggregate([
      {
        $group: {
          _id: "$atsFriendly",
          count: { $sum: 1 }
        }
      }
    ]);

    const topMissingKeywords = await Resume.aggregate([
      { $unwind: "$missingKeywords" },
      { $group: { _id: "$missingKeywords", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topGrammarIssues = await Resume.aggregate([
      { $unwind: "$grammarIssues" },
      { $group: { _id: "$grammarIssues", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalResumes,
      scoreDistribution,
      readabilityDistribution,
      atsFriendlyCount,
      topMissingKeywords,
      topGrammarIssues
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}