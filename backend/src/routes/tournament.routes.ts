import express from "express";
import { Tournament } from "../models/Tournament.model.js";
import { Match } from "../models/Match.model.js";
import { protect } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";
import { Channel } from "../models/Channel.model.js";

const router = express.Router();

// Create a new tournament
router.post("/", async (req, res) => {
  console.log("i reach this point");
  try {
    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(req.body.channelId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid channel ID format",
      });
    }

    // Create tournament with validated data
    const tournament = new Tournament({
      name: req.body.name,
      description: req.body.description,
      channelId: new mongoose.Types.ObjectId(req.body.channelId),
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
    });

    await tournament.save();

    // Add the tournament ID to the channel's tournaments array
    const updatedChannel = await Channel.findByIdAndUpdate(
      tournament.channelId,
      { $push: { tournaments: tournament._id } },
      { new: true }
    );

    if (!updatedChannel) {
      // Clean up: delete the tournament if the channel was not found
      await Tournament.findByIdAndDelete(tournament._id);
      console.error("Channel not found for channelId:", tournament.channelId);
      return res.status(404).json({
        success: false,
        error: "Channel not found",
      });
    }

    res.status(201).json({
      success: true,
      data: tournament,
    });
  } catch (error: any) {
    console.error("Error creating tournament:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Error creating tournament",
    });
  }
});

// Get all tournaments for a channel
router.get("/channel/:channelId", protect, async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      channelId: req.params.channelId,
    })
      .populate("matchIds")
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      data: tournaments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a single tournament
router.get("/:id", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      "matchIds"
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    res.json({
      success: true,
      data: tournament,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update a tournament
router.put("/:id", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    res.json({
      success: true,
      data: tournament,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete a tournament
router.delete("/:id", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    // Delete all matches associated with this tournament
    await Match.deleteMany({ tournamentId: tournament._id });

    // Remove tournament ID from channel's tournaments array
    await Channel.findByIdAndUpdate(tournament.channelId, {
      $pull: { tournaments: tournament._id },
    });

    // Delete the tournament
    await tournament.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add a match to a tournament
router.post("/:id/matches", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    const match = new Match({
      ...req.body,
      tournamentId: tournament._id,
    });

    await match.save();
    // Add match ID to tournament
    tournament.matchIds.push(match._id as mongoose.Types.ObjectId);
    await tournament.save();

    res.status(201).json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Remove a match from a tournament
router.delete("/:id/matches/:matchId", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    // Remove match ID from tournament
    tournament.matchIds = tournament.matchIds.filter(
      (id) => id.toString() !== req.params.matchId
    );
    await tournament.save();

    // Delete the match
    await Match.findByIdAndDelete(req.params.matchId);

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get tournament statistics
router.get("/:id/stats", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate({
      path: "matchIds",
      select: "stats team1 team2 winner status",
    });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    // Calculate tournament statistics
    const stats = {
      totalMatches: tournament.matchIds.length,
      completedMatches: tournament.matchIds.filter(
        (match: any) => match.status === "COMPLETED"
      ).length,
      inProgressMatches: tournament.matchIds.filter(
        (match: any) => match.status === "IN_PROGRESS"
      ).length,
      pendingMatches: tournament.matchIds.filter(
        (match: any) => match.status === "PENDING"
      ).length,
      matches: tournament.matchIds.map((match: any) => ({
        id: match._id,
        stats: match.stats,
        team1: match.team1,
        team2: match.team2,
        winner: match.winner,
        status: match.status,
      })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all tournaments
router.get("/", async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("matchIds")
      .populate("channelId", "name description")
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      data: tournaments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
