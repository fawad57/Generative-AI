const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/dbConnection");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to database
connectDB();

const PORT = process.env.PORT || 3002;

// Routes
app.use("/profile", profileRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ message: "User Service is running" });
});

app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
