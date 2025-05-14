import express, { Request, Response } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.middleware.js";
import { Channel } from "../models/Channel.model.js";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";
import mongoose, { Types } from "mongoose";

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
      const isAdmin = (channel.admins as Types.ObjectId[]).some(
        (adminId) => adminId.toString() === req.user.id.toString()
      );
      const isOwner =
        (channel.owner as Types.ObjectId).toString() === req.user.id.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update channel",
        });
      }

      const { description, image } = req.body;

      if (description) channel.description = description;
      if (image !== undefined) channel.image = image;

      await channel.save();

      // Return the updated channel with populated fields
      const updatedChannel = await Channel.findById(channel._id)
        .populate("owner", "_id username profilePicture")
        .populate("members", "username profilePicture")
        .populate("admins", "username profilePicture");

      res.json({
        success: true,
        data: updatedChannel,
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
    if ((channel.owner as Types.ObjectId).toString() !== req.user.id) {
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
      if ((channel.owner as Types.ObjectId).toString() === req.user.id) {
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
      channel.members = (channel.members as Types.ObjectId[]).filter(
        (memberId) => memberId.toString() !== req.user.id
      );

      // Remove user from admins array if they were an admin
      channel.admins = (channel.admins as Types.ObjectId[]).filter(
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

// List all public channels
router.get("/", protect, async (req: Request, res: Response) => {
  try {
    const channels = await Channel.find()
      .populate("owner", "username profilePicture")
      .populate("members", "username profilePicture")
      .populate("admins", "username profilePicture")
      .select("-passcode"); // Don't send passcode to client

    res.json({
      success: true,
      data: channels,
    });
  } catch (error) {
    logger.error("List Channels Error:", error);
    res.status(500).json({
      success: false,
      message: "Error listing channels",
    });
  }
});

// Update channel passcode
router.patch(
  "/:channelId/passcode",
  protect,
  [body("passcode").trim().isLength({ min: 6 })],
  async (req: Request, res: Response) => {
    try {
      const channel = await Channel.findById(req.params.channelId);

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      // Only owner can change passcode
      if ((channel.owner as Types.ObjectId).toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Only channel owner can change passcode",
        });
      }

      channel.passcode = req.body.passcode;
      await channel.save();

      res.json({
        success: true,
        message: "Channel passcode updated successfully",
      });
    } catch (error) {
      logger.error("Update Channel Passcode Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating channel passcode",
      });
    }
  }
);

// Promote member to admin
router.post(
  "/:channelId/promote/:userId",
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

      // Only owner can promote members
      if ((channel.owner as Types.ObjectId).toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Only channel owner can promote members",
        });
      }

      const userId = new Types.ObjectId(req.params.userId);

      // Check if user is a member
      if (
        !(channel.members as Types.ObjectId[]).some(
          (memberId) => memberId.toString() === userId.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "User is not a member of this channel",
        });
      }

      // Check if user is already an admin
      if (
        (channel.admins as Types.ObjectId[]).some(
          (adminId) => adminId.toString() === userId.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "User is already an admin",
        });
      }

      channel.admins.push(userId);
      await channel.save();

      res.json({
        success: true,
        message: "Member promoted to admin successfully",
      });
    } catch (error) {
      logger.error("Promote Member Error:", error);
      res.status(500).json({
        success: false,
        message: "Error promoting member",
      });
    }
  }
);

// Demote admin to member
router.post(
  "/:channelId/demote/:userId",
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

      // Only owner can demote admins
      if ((channel.owner as Types.ObjectId).toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Only channel owner can demote admins",
        });
      }

      const userId = new Types.ObjectId(req.params.userId);

      // Check if user is an admin
      if (
        !(channel.admins as Types.ObjectId[]).some(
          (adminId) => adminId.toString() === userId.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "User is not an admin of this channel",
        });
      }

      // Remove user from admins array
      channel.admins = (channel.admins as Types.ObjectId[]).filter(
        (adminId) => adminId.toString() !== userId.toString()
      );
      await channel.save();

      res.json({
        success: true,
        message: "Admin demoted to member successfully",
      });
    } catch (error) {
      logger.error("Demote Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Error demoting admin",
      });
    }
  }
);

// Kick member from channel
router.post(
  "/:channelId/kick/:userId",
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

      // Only owner or admins can kick members
      const isAdmin = (channel.admins as Types.ObjectId[]).some(
        (adminId) => adminId.toString() === req.user.id
      );
      const isOwner =
        (channel.owner as Types.ObjectId).toString() === req.user.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to kick members",
        });
      }

      const userId = new Types.ObjectId(req.params.userId);

      // Cannot kick the owner
      if ((channel.owner as Types.ObjectId).toString() === userId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot kick the channel owner",
        });
      }

      // Check if user is a member
      if (
        !(channel.members as Types.ObjectId[]).some(
          (memberId) => memberId.toString() === userId.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "User is not a member of this channel",
        });
      }

      // Remove user from members array
      channel.members = (channel.members as Types.ObjectId[]).filter(
        (memberId) => memberId.toString() !== userId.toString()
      );

      // Remove user from admins array if they were an admin
      channel.admins = (channel.admins as Types.ObjectId[]).filter(
        (adminId) => adminId.toString() !== userId.toString()
      );

      await channel.save();

      // Remove channel from user's channels array
      await User.findByIdAndUpdate(userId, {
        $pull: { channels: channel._id },
      });

      res.json({
        success: true,
        message: "Member kicked successfully",
      });
    } catch (error) {
      logger.error("Kick Member Error:", error);
      res.status(500).json({
        success: false,
        message: "Error kicking member",
      });
    }
  }
);

// Get channel statistics
router.get(
  "/:channelId/stats",
  protect,
  async (req: Request, res: Response) => {
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

      // Check if user is a member
      if (
        !(channel.members as Types.ObjectId[]).some(
          (memberId) => memberId.toString() === req.user.id
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view channel statistics",
        });
      }

      const stats = {
        totalMembers: channel.members.length,
        totalAdmins: channel.admins.length,
        createdAt: channel.createdAt,
        lastActivity: channel.updatedAt,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Get Channel Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching channel statistics",
      });
    }
  }
);

// Search channels
router.get("/search", protect, async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const channels = await Channel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .populate("owner", "username profilePicture")
      .populate("members", "username profilePicture")
      .select("-passcode")
      .limit(10);

    res.json({
      success: true,
      data: channels,
    });
  } catch (error) {
    logger.error("Search Channels Error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching channels",
    });
  }
});

// Transfer channel ownership
router.post(
  "/:channelId/transfer/:userId",
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

      // Only current owner can transfer ownership
      if ((channel.owner as Types.ObjectId).toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Only channel owner can transfer ownership",
        });
      }

      const newOwnerId = new Types.ObjectId(req.params.userId);

      // Check if new owner is a member
      if (
        !(channel.members as Types.ObjectId[]).some(
          (memberId) => memberId.toString() === newOwnerId.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "New owner must be a member of the channel",
        });
      }

      // Update channel ownership
      channel.owner = newOwnerId;

      // Add new owner to admins if not already an admin
      if (
        !(channel.admins as Types.ObjectId[]).some(
          (adminId) => adminId.toString() === newOwnerId.toString()
        )
      ) {
        channel.admins.push(newOwnerId);
      }

      await channel.save();

      res.json({
        success: true,
        message: "Channel ownership transferred successfully",
      });
    } catch (error) {
      logger.error("Transfer Ownership Error:", error);
      res.status(500).json({
        success: false,
        message: "Error transferring channel ownership",
      });
    }
  }
);

export default router;
