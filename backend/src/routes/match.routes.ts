import express from "express";
import { Match } from "../models/Match.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { protect } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all matches for a tournament
router.get("/tournament/:tournamentId", protect, async (req, res) => {
  try {
    // Validate if the tournament ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.tournamentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tournament ID format",
      });
    }

    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    const matches = await Match.find({ tournamentId: tournament._id })
      .populate("team1.players.userId", "username profilePicture")
      .populate("team2.players.userId", "username profilePicture")
      .populate("winner", "username profilePicture")
      .sort({ round: 1, matchNumber: 1 });

    res.json({
      success: true,
      data: matches,
    });
  } catch (error: any) {
    console.error("Fetch Tournament Matches Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tournament matches",
      error: error.message,
    });
  }
});

// Delete a match
router.delete("/:id", protect, async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID format",
      });
    }

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // If the match is part of a tournament, remove it from the tournament's matchIds
    if (match.tournamentId) {
      await Tournament.findByIdAndUpdate(match.tournamentId, {
        $pull: { matchIds: match._id },
      });
    }

    // Delete the match
    await match.deleteOne();

    res.json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting match",
      error: error.message,
    });
  }
});

export default router;
