const User = require("../models/User");
const Resume = require("../models/Resume");

exports.profile = async (req, res) => {
    try {
      const { userId } = req.user;
        console.log(userId);
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const user = await User.findById(userId).populate("resumes");
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const lastTwoResumes = user.resumes.length
        ? await Resume.find({ _id: { $in: user.resumes.slice(-2) } })
        : [];
        // ? await Resume.findById(user.resumes[user.resumes.length - 1])
  
      res.json({ user, lastTwoResumes });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Server Error" });
    }
  }

exports.updateProfile = async (req, res) => {
    console.log("Route: /update-profile");
    try {
      const { userId } = req.user;
      console.log(userId);
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const {firstName,lastName} = req.body;

      const user = await User.findByIdAndUpdate(
        userId,                           // 1. The ID of the user to update
    { $set: { firstName: firstName, lastName: lastName } }, // 2. Replace firstName & lastName
    { new: true }
      )
  
      if (!user) {
        return res.status(404).json({ error: "Update Failed" });
      }
      console.log("Updating is successful");
      res.json({user});
    } catch (error) {
      console.error("Update Failed:", error);
      res.status(500).json({ error: "Update Failed Error" });
    }
  }