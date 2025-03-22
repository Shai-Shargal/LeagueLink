import express, { Request, Response } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.middleware.js";
import { Channel } from "../models/Channel.model.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Create a new channel
router.post(
  "/",
  protect,
  [
    body("name").trim().isLength({ min: 3 }),
    body("description").trim().isLength({ min: 10 }),
    body("sport").trim().notEmpty(),
    body("isPrivate").isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      const { name, description, sport, isPrivate } = req.body;

      const channel = await Channel.create({
        name,
        description,
        sport,
        isPrivate,
        owner: req.user.id,
        admins: [req.user.id],
        members: [req.user.id],
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

// Get all public channels
router.get("/", protect, async (req: Request, res: Response) => {
  try {
    const channels = await Channel.find({ isPrivate: false })
      .populate("owner", "username")
      .select("name description sport members");

    res.json({
      success: true,
      data: channels,
    });
  } catch (error) {
    logger.error("Get Channels Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching channels",
    });
  }
});

// Get channel by ID
router.get("/:id", protect, async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("owner", "username")
      .populate("members", "username")
      .populate("admins", "username");

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    // Check if user has access to private channel
    if (channel.isPrivate && !channel.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this channel",
      });
    }

    res.json({
      success: true,
      data: channel,
    });
  } catch (error) {
    logger.error("Get Channel Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching channel",
    });
  }
});

// Join a channel
router.post("/:id/join", protect, async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    if (channel.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already a member of this channel",
      });
    }

    channel.members.push(req.user.id);
    await channel.save();

    res.json({
      success: true,
      message: "Successfully joined the channel",
    });
  } catch (error) {
    logger.error("Join Channel Error:", error);
    res.status(500).json({
      success: false,
      message: "Error joining channel",
    });
  }
});

export default router;
