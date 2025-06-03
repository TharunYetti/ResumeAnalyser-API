// node version 20.18.0
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");

const connectDB = require("./src/config/database");
const setupSwagger = require("./src/config/swagger");

const authRouter = require("./src/routes/auth");
const resumeRouter = require("./src/routes/resume");
const userRouter = require("./src/routes/user");

const app = express();
const PORT = process.env.PORT || 7777;

// CORS Setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://resumify-client.vercel.app",
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Log every request
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Swagger Docs
setupSwagger(app);

// Test Route
app.get("/ping", (req, res) => {
  console.log("✅ Ping route hit!");
  res.send("pong");
});

// Mount Routes
app.use("/", authRouter);
app.use("/user", userRouter);
app.use("/resume", resumeRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start Server after DB Connection
connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
