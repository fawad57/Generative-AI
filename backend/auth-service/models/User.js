const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  phone: {
    type: String,
  },
  username: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
  },
  bio: {
    type: String,
    maxlength: 300,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    default: "customer",
  },
  profilePicture: String,
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  accountVisibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  accountStatus: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
