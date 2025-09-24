const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000", 
];


//  Apply proper CORS config
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

//  JSON body parser
app.use(express.json());

//  Routes
app.get("/", (req, res) => {
  res.send("Shuttle Management System API is running");
});

//  Import and use route files
app.use("/api/auth", require("./routes/auth"));
app.use("/api/routes", require("./routes/routes"));
app.use("/api/stops", require("./routes/stops"));
app.use("/api/wallet", require("./routes/wallet"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/recommendations", require("./routes/recommendations"));

// Server & Mongo config
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {});
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
