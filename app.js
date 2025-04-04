//node version used 20.18.0
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/config/database");
const { connect } = require("mongoose");
const session = require("express-session");

const authRouter = require("./src/routes/auth");
const resumeRouter = require("./src/routes/resume");
const userRouter = require("./src/routes/user");

require("dotenv").config();

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://resumify-client.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB().then(() => {
  console.log("Database connected");
  app.listen(7777, () => {
    console.log("Server started on http://localhost:7777");
  });
}).catch((err)=>{
    console.error("Database cannot be connected...!!", err.message);
});

app.use(express.json()); // Middleware to parse JSON
app.use(cookieParser());

app.use("/",authRouter);
app.use("/resume", resumeRouter);
app.use("/user", userRouter);
