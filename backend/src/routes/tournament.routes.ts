import express from "express";
import { Tournament } from "../models/Tournament.model.js";
import { Match } from "../models/Match.model.js";
import { Channel } from "../models/Channel.model.js";
import { protect } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";

const router = express.Router();

// ========== TOURNAMENT CRUD ==========

// Create a new tournament
router.post("/", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.channelId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid channel ID format" });
    }

    const tournament = new Tournament({
      name: req.body.name,
      description: req.body.description,
      channelId: new mongoose.Types.ObjectId(req.body.channelId),
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
    });

    await tournament.save();

    const updatedChannel = await Channel.findByIdAndUpdate(
      tournament.channelId,
      { $push: { tournaments: tournament._id } },
      { new: true }
    );

    if (!updatedChannel) {
      await Tournament.findByIdAndDelete(tournament._id);
      return res
        .status(404)
        .json({ success: false, error: "Channel not found" });
    }

    res.status(201).json({ success: true, data: tournament });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all tournaments for a channel
router.get("/channel/:channelId", async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      channelId: req.params.channelId,
    })
      .populate("matchIds")
      .sort({ date: -1, time: -1 });

    res.json({ success: true, data: tournaments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single tournament
router.get("/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      "matchIds"
    );

    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    res.json({ success: true, data: tournament });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    res.json({ success: true, data: tournament });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a tournament (including its matches)
router.delete("/:id", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    await Match.deleteMany({ tournamentId: tournament._id });

    await Channel.findByIdAndUpdate(tournament.channelId, {
      $pull: { tournaments: tournament._id },
    });

    await tournament.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== MATCHES WITHIN TOURNAMENTS ==========

// Add a match to a tournament
router.post("/:id/matches", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    // Validate required fields
    const requiredFields = [
      "team1",
      "team2",
      "bestOf",
      "position",
      "round",
      "matchNumber",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          error: `Missing required field: ${field}`,
        });
      }
    }

    // Create match with all fields
    const match = new Match({
      tournamentId: tournament._id,
      team1: {
        players: req.body.team1.players.map((player: any) => ({
          userId: player.userId,
          username: player.username,
          profilePicture: player.profilePicture,
        })),
        score: req.body.team1.score || 0,
      },
      team2: {
        players: req.body.team2.players.map((player: any) => ({
          userId: player.userId,
          username: player.username,
          profilePicture: player.profilePicture,
        })),
        score: req.body.team2.score || 0,
      },
      bestOf: req.body.bestOf,
      position: req.body.position,
      round: req.body.round,
      matchNumber: req.body.matchNumber,
      nextMatchId: req.body.nextMatchId,
      status: req.body.status || "PENDING",
      winner: req.body.winner,
      gameScores: req.body.gameScores || [],
      stats: req.body.stats,
    });

    await match.save();

    tournament.matchIds.push(match._id as mongoose.Types.ObjectId);
    await tournament.save();

    res.status(201).json({ success: true, data: match });
  } catch (error: any) {
    console.error("Error creating match:", error);
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.errors, // Include validation errors if any
    });
  }
});

// Remove a match from a tournament
router.delete("/:id/matches/:matchId", protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    tournament.matchIds = tournament.matchIds.filter(
      (id) => id.toString() !== req.params.matchId
    );
    await tournament.save();

    await Match.findByIdAndDelete(req.params.matchId);

    res.json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all matches for a tournament
router.get("/:id/matches", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    const matches = await Match.find({ tournamentId: tournament._id })
      .populate("team1.players.userId", "username profilePicture")
      .populate("team2.players.userId", "username profilePicture")
      .populate("winner", "username profilePicture")
      .sort({ round: 1, matchNumber: 1 });

    res.json({ success: true, data: matches });
  } catch (error: any) {
    console.error("Error fetching tournament matches:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
