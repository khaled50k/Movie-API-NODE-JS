const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/User");
const { Session } = require("../../models/Session");
const {
  verifyTokenAndAdmin,
  getUserId,
  verifyTokenAndAuthorization,
} = require("../VerifyToken");

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

    const expirationDuration = 60 * 60 * 24 * 10; // 10 days in seconds
    const exp = new Date(Date.now() + expirationDuration * 1000);

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: exp.getTime() }
    );

    // Create a session record
    const session = new Session({
      userId: user._id,
      exp: exp,
      session: token,
    });

    // Save the session to the database
    await session.save();

    // Set the JWT as a cookie in the response
    res.cookie("SESSION", token, { httpOnly: true, expires: exp });

    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log in" });
  }
});
// get users route
router.get("/user/:id?/", verifyTokenAndAdmin, async (req, res) => {
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

// Get user data by session cookie
router.get("/user/data/info", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve user data" });
  }
});

// Logout route
router.post("/logout", async (req, res) => {
  try {
    // Get the session token from the request cookies
    const sessionToken = req.cookies.SESSION;

    // Update the session record in the database to revoke the session
    await Session.findOneAndUpdate(
      { session: sessionToken },
      { revoked: true }
    );

    // Clear the session token cookie
    res.clearCookie("SESSION");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout" });
  }
});

module.exports = router;
