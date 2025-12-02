const express = require("express");
const {
  signup,
  login,
  getMe,
  refresh,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/refresh", refresh);
router.post("/logout", verifyToken, logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
