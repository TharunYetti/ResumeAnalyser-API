const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const User = require("../models/User");
const passport = require("passport");

exports.signup = async (req, res) => {
  try {
    console.log("came to sign up!");
    validateSignUpData(req);
    console.log("Validation Successful!");
    const { firstName, lastName, emailId, password } = req.body;
    console.log("Parsed user data:", firstName, lastName, emailId, password);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      role: "user",
      password: passwordHash,
    });

    let savedUser = await user.save();
    savedUser = savedUser.toObject(); // Convert to plain object
    delete savedUser.password; // Remove password from the response
    console.log("User saved successfully:", savedUser);
    const token = await jwt.sign(
      { userId: savedUser._id, email: savedUser.emailId },
      "RESUME@123",
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res
      .status(201)
      .json({ message: "User registered successfully", data: savedUser });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).send("Error: " + err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    let user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new Error("Invalid credentials");
    }
    const token = await jwt.sign(
      { userId: user._id, email: user.emailId },
      "RESUME@123",
      {
        expiresIn: "1d",
      }
    );
    console.log(token);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    user = user.toObject(); // Convert to plain object
    delete user.password; // Remove password from the response
    res.send({ user: user, token: token });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

exports.googlelogin = async (req, res) => {
  const { emailId, firstName, lastName } = req.body;

  console.log(req.body);

  try {
    let user = await User.findOne({ emailId });

    if (!user) {
      console.log("Creating new Google user...");
      user = new User({
        firstName,
        lastName,
        emailId,
        role: "user",
        password: "googleLogin",
      });
      await user.save(); // 🔹 Saves the new user to MongoDB
    }
    console.log("User found or created:", user);
    const token = await jwt.sign(
      { userId: user._id, email: user.emailId },
      "RESUME@123",
      {
        expiresIn: "1d",
      }
    );

    console.log(token);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.send({ user: user, token: token });
  } catch (error) {
    console.error("Error during login:", error);
    console.log(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "Logout successful" });
};

// For Registering Admin
exports.signupAdmin = async (req, res) => {
  try {
    console.log("came to Admin sign up!");
    validateSignUpData(req);
    console.log("Validation Successful!");
    const { firstName, lastName, emailId, password } = req.body;
    console.log("Parsed admin data:", firstName, lastName, emailId, password);

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = new User({
      firstName,
      lastName,
      emailId,
      role: "admin",
      password: passwordHash,
    });

    const savedAdmin = await admin.save();

    const token = await jwt.sign(
      { userId: savedAdmin._id, email: savedAdmin.emailId },
      "RESUME@123",
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res
      .status(201)
      .json({ message: "Admin registered successfully", data: savedAdmin });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).send("Error: " + err.message);
  }
};
