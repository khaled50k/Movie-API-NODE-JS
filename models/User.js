// Import required modules
const mongoose = require("mongoose");

// Create a schema for the User model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "user"] },
  deleted: { type: Boolean, default: false },
});

// Create the User model
const User = mongoose.model("User", userSchema);
module.exports = { User };
