import express from "express";
import { Match } from "../models/Match.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { protect } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";

const router = express.Router();

// Create a new match
router.post("/", protect, async (req, res) => {
  try {
    // Check if tournament exists
    const tournament = await Tournament.findById(req.body.tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    const match = new Match(req.body);
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

// Get all matches for a tournament
router.get("/tournament/:tournamentId", protect, async (req, res) => {
  try {
    // Check if tournament exists
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    const matches = await Match.find({
      tournamentId: req.params.tournamentId,
    }).sort({ position: 1 });

    res.json({
      success: true,
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a single match
router.get("/:id", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update a match
router.put("/:id", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    // Update match fields
    const allowedUpdates = ["status", "winner", "team1", "team2", "bestOf"];
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(match, updates);
    await match.save();

    res.json({
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

// Get match statistics
router.get("/:id/stats", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    res.json({
      success: true,
      data: match.stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update match statistics
router.put("/:id/stats", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    // Update stats
    match.stats = {
      ...match.stats,
      ...req.body,
    };

    await match.save();

    res.json({
      success: true,
      data: match.stats,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete a match
router.delete("/:id", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    // Remove match ID from tournament
    const tournament = await Tournament.findById(match.tournamentId);
    if (tournament) {
      const matchId = match._id as mongoose.Types.ObjectId;
      tournament.matchIds = tournament.matchIds.filter(
        (id) => id.toString() !== matchId.toString()
      );
      await tournament.save();
    }

    // Delete the match
    await match.deleteOne();

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

export default router;
