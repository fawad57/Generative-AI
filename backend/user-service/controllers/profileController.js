const User = require("../models/User");
const axios = require("axios");

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch mood entries count from mood-service
    let moodEntriesCount = user.moodEntriesCount;
    try {
      const moodResponse = await axios.get(`${process.env.MOOD_SERVICE_URL}/tracks/count/${req.user._id}`);
      moodEntriesCount = moodResponse.data.count || moodEntriesCount;
    } catch (error) {
      console.log("Could not fetch mood entries count, using stored value");
    }

    // Calculate balance score (placeholder logic - average of recent mood scores)
    let balanceScore = user.balanceScore;
    try {
      const balanceResponse = await axios.get(`${process.env.MOOD_SERVICE_URL}/balance/${req.user._id}`);
      balanceScore = balanceResponse.data.score || balanceScore;
    } catch (error) {
      console.log("Could not fetch balance score, using stored value");
    }

    const profileData = {
      ...user.toObject(),
      moodEntriesCount,
      balanceScore,
    };

    res.json(profileData);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, username, bio, address, dateOfBirth, gender } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;

    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update quick stats (internal function, might be called from other services)
const updateQuickStats = async (userId, stats) => {
  try {
    const updateData = {};
    if (stats.moodEntriesCount !== undefined) updateData.moodEntriesCount = stats.moodEntriesCount;
    if (stats.activitiesCompleted !== undefined) updateData.activitiesCompleted = stats.activitiesCompleted;
    if (stats.balanceScore !== undefined) updateData.balanceScore = stats.balanceScore;

    await User.findByIdAndUpdate(userId, updateData);
  } catch (error) {
    console.error("Update quick stats error:", error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateQuickStats,
};
