import express, { Request, Response } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { Match, IMatch } from "../models/Match.model.js";
import { Tournament } from "../models/Tournament.model.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";
import { Channel } from "../models/Channel.model.js";

const router = express.Router();

// Get match by ID
router.get("/:matchId", protect, async (req: Request, res: Response) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate("tournament")
      .populate("team1.players.userId")
      .populate("team2.players.userId");

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
    logger.error("Get Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching match",
    });
  }
});

// Get matches by tournament
router.get(
  "/tournament/:tournamentId",
  protect,
  async (req: Request, res: Response) => {
    try {
      const matches = await Match.find({ tournament: req.params.tournamentId })
        .populate("team1.players.userId")
        .populate("team2.players.userId")
        .sort({ round: 1, matchNumber: 1 });

      res.json({
        success: true,
        data: matches,
      });
    } catch (error) {
      logger.error("Get Tournament Matches Error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching tournament matches",
      });
    }
  }
);

// Create new match
router.post("/", protect, async (req: Request, res: Response) => {
  try {
    const {
      tournament,
      round,
      matchNumber,
      position,
      bestOf,
      teamType,
      team1,
      team2,
      nextMatchId,
    } = req.body;

    // Validate tournament exists
    const tournamentExists = await Tournament.findById(tournament);
    if (!tournamentExists) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Create the match
    const match = await Match.create({
      tournament: new mongoose.Types.ObjectId(tournament),
      round,
      matchNumber,
      position: {
        x: position.x,
        y: position.y,
      },
      bestOf,
      teamType,
      team1: {
        players:
          team1.players?.map((p: any) => ({
            userId: new mongoose.Types.ObjectId(p.userId),
            username: p.username,
          })) || [],
        isGuest: team1.isGuest || false,
        score: team1.score || 0,
      },
      team2: {
        players:
          team2.players?.map((p: any) => ({
            userId: new mongoose.Types.ObjectId(p.userId),
            username: p.username,
          })) || [],
        isGuest: team2.isGuest || false,
        score: team2.score || 0,
      },
      nextMatchId: nextMatchId
        ? new mongoose.Types.ObjectId(nextMatchId)
        : null,
      stats: {
        scores: [],
      },
      games: [],
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: match,
    });
  } catch (error) {
    logger.error("Create Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating match",
    });
  }
});

// Update match
router.put("/:matchId", protect, async (req: Request, res: Response) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Check if user is tournament organizer or channel admin
    const tournament = await Tournament.findById(match.tournament);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Associated tournament not found",
      });
    }

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
        message: "Not authorized to update match",
      });
    }

    const { round, matchNumber, bestOf, team1, team2, nextMatchId, status } =
      req.body;

    // Update match fields
    if (round !== undefined) match.round = round;
    if (matchNumber !== undefined) match.matchNumber = matchNumber;
    if (bestOf) match.bestOf = bestOf;
    if (team1) match.team1 = team1;
    if (team2) match.team2 = team2;
    if (nextMatchId)
      match.nextMatchId = new mongoose.Types.ObjectId(nextMatchId);
    if (status) match.status = status;

    await match.save();

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    logger.error("Update Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating match",
    });
  }
});

// Delete match
router.delete("/:matchId", protect, async (req: Request, res: Response) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Check if user is tournament organizer or channel admin
    const tournament = await Tournament.findById(match.tournament);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Associated tournament not found",
      });
    }

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
        message: "Not authorized to delete match",
      });
    }

    // Delete match
    await match.deleteOne();

    res.json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting match",
    });
  }
});

// Update game stats
router.patch(
  "/:matchId/games/:gameNumber/stats",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { gameNumber } = req.params;
      const { team1Stats, team2Stats, winner } = req.body;

      const match = await Match.findById(req.params.matchId);
      if (!match) {
        return res.status(404).json({
          success: false,
          message: "Match not found",
        });
      }

      // Find or create game
      const gameIndex = parseInt(gameNumber) - 1;
      if (!match.games[gameIndex]) {
        match.games[gameIndex] = {
          number: parseInt(gameNumber),
          winner: null,
          team1Stats: {},
          team2Stats: {},
        };
      }

      // Update game stats
      match.games[gameIndex].team1Stats = team1Stats || {};
      match.games[gameIndex].team2Stats = team2Stats || {};
      match.games[gameIndex].winner = winner || null;

      // Update match stats
      if (winner) {
        if (winner.toString() === match.team1.players[0].userId.toString()) {
          match.team1.score += 1;
          match.stats.scores[gameIndex] = { team1: 1, team2: 0 };
        } else {
          match.team2.score += 1;
          match.stats.scores[gameIndex] = { team1: 0, team2: 1 };
        }
      }

      // Check if match is completed
      const gamesNeededToWin = Math.ceil(match.bestOf / 2);
      if (
        match.team1.score >= gamesNeededToWin ||
        match.team2.score >= gamesNeededToWin
      ) {
        match.status = "completed";
      } else {
        match.status = "in_progress";
      }

      await match.save();

      res.json({
        success: true,
        data: match,
      });
    } catch (error) {
      logger.error("Update Game Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating game stats",
      });
    }
  }
);

export default router;
