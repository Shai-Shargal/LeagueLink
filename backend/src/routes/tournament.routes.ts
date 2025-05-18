import express, { Request, Response } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.middleware.js";
import {
  Tournament,
  ITournament,
  ITournamentParticipant,
} from "../models/Tournament.model.js";
import { Channel } from "../models/Channel.model.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { Match } from "../models/Match.model.js";

const router = express.Router();

// Create new tournament
router.post("/", protect, async (req: Request, res: Response) => {
  try {
    const { name, description, channelId, startDate, location } = req.body;

    // Validate required fields
    if (!name || !channelId || !startDate || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, channelId, startDate, and location are required",
      });
    }

    // Validate channel exists and user has permission
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const isAdmin = channel.admins.includes(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create tournaments in this channel",
      });
    }

    // Create tournament with only the essential fields
    const tournament = await Tournament.create({
      name,
      description: description || "",
      channel: channelId,
      organizer: req.user.id,
      startDate: new Date(startDate),
      location,
      participants: [],
    });

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
});

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

    // Get all matches for this tournament
    const matches = await Match.find({ tournament: tournament._id }).sort({
      round: 1,
      matchNumber: 1,
    });

    res.json({
      success: true,
      data: {
        ...tournament.toObject(),
        matches,
      },
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

    if (tournament.participants.some((p) => p.userId === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this tournament",
      });
    }

    // Add user as participant
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    tournament.participants.push({
      userId: req.user.id,
      username: user.username,
      isGuest: false,
      status: "active",
    });

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
        tournament.participants.forEach(
          (participant: ITournamentParticipant) => {
            participants.add(participant.userId);
          }
        );
      });

      // Calculate stats for each participant
      const userStats = await Promise.all(
        Array.from(participants).map(async (userId) => {
          const userTournaments = tournaments.filter((tournament) =>
            tournament.participants.some(
              (p: ITournamentParticipant) => p.userId === userId
            )
          );

          const wins = userTournaments.filter(
            (tournament) =>
              tournament.participants.find((p) => p.userId === userId)
                ?.status === "winner"
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

// Update tournament
router.put("/:id", protect, async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Check if user is tournament organizer or channel admin
    const channel = await Channel.findById(tournament.channel);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Associated channel not found",
      });
    }

    const isAdmin = channel.admins.includes(req.user.id);
    const isOrganizer = tournament.organizer.toString() === req.user.id;

    if (!isAdmin && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update tournament",
      });
    }

    const { name, description, startDate, location } = req.body;

    // Update tournament fields
    if (name) tournament.name = name;
    if (description) tournament.description = description;
    if (startDate) tournament.startDate = new Date(startDate);
    if (location) tournament.location = location;

    await tournament.save();

    res.json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    logger.error("Update Tournament Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tournament",
    });
  }
});

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

    // Check if user is tournament organizer or channel admin
    const channel = await Channel.findById(tournament.channel);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Associated channel not found",
      });
    }

    const isAdmin = channel.admins.includes(req.user.id);
    const isOrganizer = tournament.organizer.toString() === req.user.id;

    if (!isAdmin && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete tournament",
      });
    }

    // Delete all matches associated with the tournament
    await Match.deleteMany({ tournament: tournament._id });

    // Remove tournament from channel
    await Channel.findByIdAndUpdate(tournament.channel, {
      $pull: { tournaments: tournament._id },
    });

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

// Update tournament match configuration
router.patch(
  "/:tournamentId/match-config",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { matchConfig } = req.body;
      const tournament = await Tournament.findByIdAndUpdate(
        req.params.tournamentId,
        { matchConfig },
        { new: true }
      );

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
      logger.error("Update Tournament Match Config Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating tournament match configuration",
      });
    }
  }
);

// Update match bestOf
router.patch(
  "/:tournamentId/matches/:matchId/best-of",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { bestOf } = req.body;
      const match = await Match.findOneAndUpdate(
        {
          tournament: req.params.tournamentId,
          _id: req.params.matchId,
        },
        { bestOf },
        { new: true }
      );

      if (!match) {
        return res.status(404).json({
          success: false,
          message: "Match not found",
        });
      }

      res.json({
        success: true,
        data: match,
      });
    } catch (error) {
      logger.error("Update Match BestOf Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating match best of",
      });
    }
  }
);

export default router;
