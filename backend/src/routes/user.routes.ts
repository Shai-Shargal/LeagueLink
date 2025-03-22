import express, { Request, Response } from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { protect } from "../middleware/auth.middleware.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "30d" }
      );

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      logger.error("Register Error:", error);
      res.status(500).json({
        success: false,
        message: "Error registering user",
      });
    }
  }
);

// Login user
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Check user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "30d" }
      );

      res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      logger.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging in",
      });
    }
  }
);

// Get user profile
router.get("/profile", protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  protect,
  [
    body("username").optional().trim().isLength({ min: 3 }),
    body("email").optional().isEmail(),
  ],
  async (req: Request, res: Response) => {
    try {
      const { username, email } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (username) user.username = username;
      if (email) user.email = email;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      logger.error("Update Profile Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
      });
    }
  }
);

export default router;
