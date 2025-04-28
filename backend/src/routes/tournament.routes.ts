import express, { Request, Response } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.middleware.js";
import { Tournament } from "../models/Tournament.model.js";
import { Channel } from "../models/Channel.model.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";

const router = express.Router();

// Create a new tournament
router.post(
  "/",
  protect,
  [
    body("name").trim().isLength({ min: 3 }),
    body("description").trim().isLength({ min: 10 }),
    body("channelId").notEmpty(),
    body("format").isIn([
      "single_elimination",
      "double_elimination",
      "round_robin",
      "swiss",
    ]),
    body("startDate").isISO8601(),
    body("maxParticipants").isInt({ min: 2 }),
    body("rules").trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        channelId,
        format,
        startDate,
        maxParticipants,
        rules,
        prizes,
      } = req.body;

      // Check if user has permission to create tournament in channel
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      if (!channel.admins.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create tournaments in this channel",
        });
      }

      const tournament = await Tournament.create({
        name,
        description,
        channel: channelId,
        organizer: req.user.id,
        format,
        startDate,
        maxParticipants,
        rules,
        prizes,
        participants: [req.user.id],
      });

      // Add tournament to channel
      channel.tournaments.push(
        tournament._id as unknown as mongoose.Types.ObjectId
      );
      await channel.save();

      res.status(201).json({
        success: true,
        data: tournament,
      });
    } catch (error) {
      logger.error("Create Tournament Error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating tournament",
      });
    }
  }
);

// Get tournaments in a channel
router.get(
  "/channel/:channelId",
  protect,
  async (req: Request, res: Response) => {
    try {
      const tournaments = await Tournament.find({
        channel: req.params.channelId,
      })
        .populate("organizer", "username")
        .sort({ startDate: 1 });

      res.json({
        success: true,
        data: tournaments,
      });
    } catch (error) {
      logger.error("Get Tournaments Error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching tournaments",
      });
    }
  }
);

// Get tournament by ID
router.get("/:id", protect, async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("organizer", "username")
      .populate("participants", "username")
      .populate("channel", "name");

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    logger.error("Get Tournament Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tournament",
    });
  }
});

// Join a tournament
router.post("/:id/join", protect, async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    if (tournament.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this tournament",
      });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Tournament is full",
      });
    }

    tournament.participants.push(req.user.id);
    await tournament.save();

    res.json({
      success: true,
      message: "Successfully joined the tournament",
    });
  } catch (error) {
    logger.error("Join Tournament Error:", error);
    res.status(500).json({
      success: false,
      message: "Error joining tournament",
    });
  }
});

// Get channel user stats
router.get(
  "/stats/channel/:channelId",
  protect,
  async (req: Request, res: Response) => {
    try {
      const tournaments = await Tournament.find({
        channel: req.params.channelId,
      }).populate("participants", "username profilePicture");

      // Get all unique participants
      const participants = new Set<string>();
      tournaments.forEach((tournament) => {
        tournament.participants.forEach((participant) => {
          participants.add(participant._id.toString());
        });
      });

      // Calculate stats for each participant
      const userStats = await Promise.all(
        Array.from(participants).map(async (userId) => {
          const userTournaments = tournaments.filter((tournament) =>
            tournament.participants.some((p) => p._id.toString() === userId)
          );

          const wins = userTournaments.filter(
            (tournament) => tournament.winner?.toString() === userId
          ).length;

          const losses = userTournaments.length - wins;
          const winRate =
            userTournaments.length > 0
              ? (wins / userTournaments.length) * 100
              : 0;

          const user = await User.findById(userId).select(
            "username profilePicture"
          );

          return {
            userId,
            username: user?.username || "Unknown",
            profilePicture: user?.profilePicture,
            totalTournaments: userTournaments.length,
            wins,
            losses,
            winRate,
            customStats: {}, // Add any custom stats here
          };
        })
      );

      res.json({
        success: true,
        data: userStats,
      });
    } catch (error) {
      logger.error("Get Channel User Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching channel user stats",
      });
    }
  }
);

// Delete tournament
router.delete("/:id", protect, async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Check if user has permission to delete tournament
    const channel = await Channel.findById(tournament.channel);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    if (!channel.admins.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this tournament",
      });
    }

    // Remove tournament from channel
    channel.tournaments = channel.tournaments.filter(
      (t: mongoose.Types.ObjectId) => t.toString() !== tournament._id.toString()
    );
    await channel.save();

    // Delete tournament
    await tournament.deleteOne();

    res.json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Tournament Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting tournament",
    });
  }
});

export default router;
