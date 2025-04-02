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
  [body("channelName").notEmpty(), body("passcode").notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const { channelName, passcode } = req.body;

      const channel = await Channel.findOne({ name: channelName });
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const channels = await Channel.find({ _id: { $in: user.channels } })
      .populate("owner", "_id username profilePicture")
      .populate("members", "username profilePicture")
      .populate("admins", "username profilePicture");

    res.json({
      success: true,
      data: channels,
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

// Update channel
router.put(
  "/:channelId",
  protect,
  [
    body("description").optional().trim().isLength({ min: 10 }),
    body("image").optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const channel = await Channel.findById(req.params.channelId);

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      // Check if user is channel owner or admin
      if (!channel.admins.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update channel",
        });
      }

      const { description, image } = req.body;

      if (description) channel.description = description;
      if (image !== undefined) channel.image = image;

      await channel.save();

      res.json({
        success: true,
        data: channel,
      });
    } catch (error) {
      logger.error("Update Channel Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating channel",
      });
    }
  }
);

// Delete channel
router.delete("/:channelId", protect, async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    // Only channel owner can delete the channel
    if (channel.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete channel",
      });
    }

    // Remove channel from all members' channels array
    await User.updateMany(
      { channels: channel._id },
      { $pull: { channels: channel._id } }
    );

    await channel.deleteOne();

    res.json({
      success: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Channel Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting channel",
    });
  }
});

// Find channel by name
router.get("/find/:name", protect, async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findOne({ name: req.params.name });
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
    logger.error("Find Channel Error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding channel",
    });
  }
});

// Leave a channel
router.post(
  "/:channelId/leave",
  protect,
  async (req: Request, res: Response) => {
    try {
      const channel = await Channel.findById(req.params.channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      // Check if user is the owner
      if (channel.owner.toString() === req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Channel owner cannot leave the channel",
        });
      }

      // Check if user is a member
      if (!channel.members.includes(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "You are not a member of this channel",
        });
      }

      // Remove user from members array
      channel.members = channel.members.filter(
        (memberId) => memberId.toString() !== req.user.id
      );

      // Remove user from admins array if they were an admin
      channel.admins = channel.admins.filter(
        (adminId) => adminId.toString() !== req.user.id
      );

      await channel.save();

      // Remove channel from user's channels array
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { channels: channel._id },
      });

      res.json({
        success: true,
        message: "Successfully left the channel",
      });
    } catch (error) {
      logger.error("Leave Channel Error:", error);
      res.status(500).json({
        success: false,
        message: "Error leaving channel",
      });
    }
  }
);

export default router;
