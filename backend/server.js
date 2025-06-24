const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import route files
const authRoutes = require("./routes/auth");
const routeRoutes = require("./routes/routes");
const stopRoutes = require("./routes/stops");
const walletRoutes = require("./routes/wallet");
const bookingRoutes = require("./routes/bookings");
const recommendationRoutes = require("./routes/recommendations");

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Allow the frontend origin
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Shuttle Management System API is running");
});

// Use API routes
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/recommendations", recommendationRoutes);

// MongoDB connection string
const PORT = process.env.PORT || 5001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/shuttle-management";

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server starting error:", error.message);
    process.exit(1);
  }
};

startServer();
