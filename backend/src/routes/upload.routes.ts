import express from "express";
import { upload } from "../services/upload.service";
import { User } from "../models/user.model";
import { Channel } from "../models/channel.model";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Upload profile picture for user
router.post(
  "/user/profile-picture",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user?._id;
      const imageUrl = `/uploads/${req.file.filename}`;

      await User.findByIdAndUpdate(userId, {
        profilePicture: imageUrl,
      });

      res.json({
        message: "Profile picture uploaded successfully",
        imageUrl,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }
);

// Upload channel picture
router.post(
  "/channel/:channelId/picture",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { channelId } = req.params;
      const userId = req.user?._id;

      // Check if user is channel owner or admin
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      if (
        channel.owner.toString() !== userId.toString() &&
        !channel.admins.includes(userId)
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update channel picture" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      await Channel.findByIdAndUpdate(channelId, {
        image: imageUrl,
      });

      res.json({
        message: "Channel picture uploaded successfully",
        imageUrl,
      });
    } catch (error) {
      console.error("Error uploading channel picture:", error);
      res.status(500).json({ message: "Error uploading channel picture" });
    }
  }
);

export default router;
