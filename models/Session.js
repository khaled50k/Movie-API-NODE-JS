const mongoose = require("mongoose");
// Create a schema for the Session model
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exp: { type: Date, required: true },
  session: { type: String, required: true },
  revoked: { type: Boolean, default: false },
});

// Create the Session model
const Session = mongoose.model("Session", sessionSchema);
module.exports = { Session };
