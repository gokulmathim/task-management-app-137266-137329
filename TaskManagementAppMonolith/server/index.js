require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Use environment configs
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

// API routes
app.use("/api/tasks", taskRoutes);

// Error handling middleware (fallback)
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// MongoDB connection and start server
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
