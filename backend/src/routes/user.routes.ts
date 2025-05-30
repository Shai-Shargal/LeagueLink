import express, { Request, Response } from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { protect } from "../middleware/auth.middleware.js";
import { logger } from "../utils/logger.js";
import { Channel } from "../models/Channel.model.js";

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

      // Create user (password will be hashed by the User model's pre-save hook)
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
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Check user exists
      const user = await User.findOne({ email });
      if (!user) {
        logger.error("Login Error: User not found for email:", email);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      logger.info("Attempting password comparison for user:", user.email);
      const isMatch = await user.comparePassword(password);
      logger.info("Password match result:", isMatch);
      if (!isMatch) {
        logger.error("Login Error: Invalid password for user:", user.email);
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
    body("bio").optional().trim().isLength({ max: 500 }),
    body("favoriteSports").optional().isArray(),
  ],
  async (req: Request, res: Response) => {
    try {
      const { username, email, bio, favoriteSports } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (email) user.email = email;
      if (bio !== undefined) user.bio = bio;
      if (favoriteSports !== undefined) user.favoriteSports = favoriteSports;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          favoriteSports: updatedUser.favoriteSports,
          profilePicture: updatedUser.profilePicture,
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

// Update profile picture
router.patch(
  "/profile-picture",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { profilePicture } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.profilePicture = profilePicture;
      await user.save();

      res.json({
        success: true,
        data: {
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      logger.error("Update Profile Picture Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile picture",
      });
    }
  }
);

// Delete profile picture
router.delete(
  "/profile-picture",
  protect,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.profilePicture = "";
      await user.save();

      res.json({
        success: true,
        data: {
          profilePicture: "",
        },
      });
    } catch (error) {
      logger.error("Delete Profile Picture Error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting profile picture",
      });
    }
  }
);

// Get user profile by username
router.get(
  "/profile/:username",
  protect,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ username: req.params.username })
        .select("-password -email")
        .populate("channels", "name description sport");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error("Get User Profile Error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user profile",
      });
    }
  }
);

// Delete user account
router.delete("/", protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove user from all channels
    await Channel.updateMany(
      { members: user._id },
      { $pull: { members: user._id, admins: user._id } }
    );

    // Delete user
    await user.deleteOne();

    res.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    logger.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user account",
    });
  }
});

export default router;
