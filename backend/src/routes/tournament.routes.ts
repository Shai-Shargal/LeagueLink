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
router.get("/channel/:channelId", protect, async (req, res) => {
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
router.get("/:id", protect, async (req, res) => {
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
  console.log("test");
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res
        .status(404)
        .json({ success: false, error: "Tournament not found" });
    }

    const match = new Match({ ...req.body, tournamentId: tournament._id });
    await match.save();

    tournament.matchIds.push(match._id as mongoose.Types.ObjectId);
    await tournament.save();

    res.status(201).json({ success: true, data: match });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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

export default router;
