import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("username").trim().isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
];

const loginValidation = [body("email").isEmail(), body("password").exists()];

// Register user
router.post(
  "/register",
  registerValidation,
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

      // Create user
      const user = await User.create({
        username,
        email,
        password,
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
router.post("/login", loginValidation, async (req: Request, res: Response) => {
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
    const isMatch = await user.comparePassword(password);
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
});

// Logout user
router.post("/logout", protect, async (req: Request, res: Response) => {
  try {
    // In a more complete implementation, you might want to add the token to a blacklist
    // or implement a token revocation mechanism

    res.json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    logger.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
});

export default router;
