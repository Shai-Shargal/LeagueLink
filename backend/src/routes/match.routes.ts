import express from "express";
import { Match } from "../models/Match.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { protect } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";

const router = express.Router();

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
