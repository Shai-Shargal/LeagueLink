import express from "express";
import { Tournament } from "../models/Tournament.model.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new tournament
router.post("/", auth, async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    await tournament.save();

    res.status(201).json({
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

// Get all tournaments for a channel
router.get("/channel/:channelId", auth, async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      channelId: req.params.channelId,
    }).sort({ date: -1, time: -1 });

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
router.get("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

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
router.put("/:id", auth, async (req, res) => {
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
router.delete("/:id", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

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

// Add a participant to a tournament
router.post("/:id/participants", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    // Check if tournament is full
    if (tournament.participantsCount >= tournament.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: "Tournament is full",
      });
    }

    // Check if user is already a participant
    const isParticipant = tournament.participants.some(
      (p) => p.userId === req.user._id.toString()
    );

    if (isParticipant) {
      return res.status(400).json({
        success: false,
        error: "Already a participant in this tournament",
      });
    }

    // Add participant
    tournament.participants.push({
      id: req.user._id.toString(),
      userId: req.user._id.toString(),
      username: req.user.username,
      profilePicture: req.user.profilePicture,
      status: "member",
      stats: {},
    });

    tournament.participantsCount += 1;
    await tournament.save();

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

// Remove a participant from a tournament
router.delete("/:id/participants/:userId", auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found",
      });
    }

    // Check if user is the creator or an admin
    if (
      tournament.createdBy.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to remove participants",
      });
    }

    // Remove participant
    tournament.participants = tournament.participants.filter(
      (p) => p.userId !== req.params.userId
    );

    tournament.participantsCount -= 1;
    await tournament.save();

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

export default router;
