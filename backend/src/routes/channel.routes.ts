import express, { Request, Response } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.middleware.js";
import { Channel } from "../models/Channel.model.js";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Create a new channel
router.post(
  "/",
  protect,
  [
    body("name").trim().isLength({ min: 3 }),
    body("description").trim().isLength({ min: 10 }),
    body("passcode").trim().isLength({ min: 6 }),
    body("image").optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const { name, description, passcode, image } = req.body;

      const channel = await Channel.create({
        name,
        description,
        passcode,
        image,
        owner: req.user.id,
        admins: [req.user.id],
        members: [req.user.id],
      });

      // Add channel to user's channels
      await User.findByIdAndUpdate(req.user.id, {
        $push: { channels: channel._id },
      });

      res.status(201).json({
        success: true,
        data: channel,
      });
    } catch (error) {
      logger.error("Create Channel Error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating channel",
      });
    }
  }
);

// Join a channel
router.post(
  "/join",
  protect,
  [body("channelId").notEmpty(), body("passcode").notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { channelId, passcode } = req.body;

      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      if (channel.passcode !== passcode) {
        return res.status(401).json({
          success: false,
          message: "Invalid passcode",
        });
      }

      if (channel.members.includes(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "You are already a member of this channel",
        });
      }

      channel.members.push(req.user.id);
      await channel.save();

      // Add channel to user's channels
      await User.findByIdAndUpdate(req.user.id, {
        $push: { channels: channel._id },
      });

      res.json({
        success: true,
        data: channel,
      });
    } catch (error) {
      logger.error("Join Channel Error:", error);
      res.status(500).json({
        success: false,
        message: "Error joining channel",
      });
    }
  }
);

// Get user's channels
router.get("/my-channels", protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "channels",
      select: "name description image members admins",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user.channels,
    });
  } catch (error) {
    logger.error("Get User Channels Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user's channels",
    });
  }
});

// Get channel details
router.get("/:channelId", protect, async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate("owner", "username profilePicture")
      .populate("members", "username profilePicture")
      .populate("admins", "username profilePicture");

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    res.json({
      success: true,
      data: channel,
    });
  } catch (error) {
    logger.error("Get Channel Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching channel details",
    });
  }
});

export default router;
