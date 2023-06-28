const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connection Successful!");
  } catch (error) {
    console.error("DB Connection Failed:", error);
  }
};

module.exports = connectDB;
