const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const otpStore = {}; // Temporary, use Redis in production

// Signup
const signup = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json("Success");
    }

    const { name, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      username: email,
    });

    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No email exists" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "The password is incorrect" });
    }

    const accessToken = jwt.sign(
      {
        name: user.name,
        _id: user._id,
        email: user.email,
        role: user.role,
        picture: user.profilePicture,
        phone: user.phone,
        username: user.username,
        bio: user.bio,
        address: user.address,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ message: "Login successful", accessToken, refreshToken, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Refresh Token
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json("Refresh token required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json("Invalid refresh token");
    }

    const newAccessToken = jwt.sign(
      {
        name: user.name,
        _id: user._id,
        email: user.email,
        role: user.role,
        picture: user.profilePicture,
        phone: user.phone,
        username: user.username,
        bio: user.bio,
        address: user.address,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json("Invalid refresh token");
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json("Logged out successfully");
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Forgot password request for email:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json("Incorrect email");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = code;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Your OTP is: ${code}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        res.status(500).json("Error sending email");
      } else {
        res.status(200).json("OTP sent successfully");
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify OTP
const verifyOtp = (req, res) => {
  const { email, code } = req.body;
  if (otpStore[email] && otpStore[email] == code) {
    res.status(200).json("OTP verified successfully");
  } else {
    res.status(400).json("Incorrect OTP");
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    res.json("Successfully changed");
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  refresh,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
