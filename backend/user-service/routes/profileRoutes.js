const express = require("express");
const multer = require("multer");
const path = require("path");
const { getProfile, updateProfile } = require("../controllers/profileController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profile-pictures"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

// Get user profile
router.get("/", authenticateToken, getProfile);

// Update user profile
router.put("/", authenticateToken, upload.single("profilePicture"), updateProfile);

module.exports = router;
