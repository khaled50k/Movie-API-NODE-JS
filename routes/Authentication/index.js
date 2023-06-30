const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/User");
const { Session } = require("../../models/Session");
const { verifyTokenAndAdmin } = require("../VerifyToken");

// Register route
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role ? role : "user",
    });

    // Save the user to the database
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the stored password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );
    const exp = new Date().getTime() + 3600000 * 24 * 10;
    // Create a session record
    const session = new Session({
      userId: user._id,
      exp: exp, // 1 hour expiration
      session: token,
    });
    // Save the session to the database
    await session.save();
    // Set the JWT as a cookie in the response
    res.cookie("SESSION", token, { httpOnly: true, maxAge: exp });

    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log in" });
  }
});
// get users route
router.get("/user/:id?", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // If an ID is provided, find a specific user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } else {
      // If no ID is provided, fetch all users
      const users = await User.find({});
      res.status(200).json({ users });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users" });
  }
});


module.exports = router;
