import express, { Request, Response } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { Match } from "../models/Match.model.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get match by ID
router.get("/:matchId", protect, async (req: Request, res: Response) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate("tournament")
      .populate("team1.id")
      .populate("team2.id")
      .populate("winner")
      .populate("games.stats.team1.player")
      .populate("games.stats.team2.player");

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

// Update match status
router.patch(
  "/:matchId/status",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const match = await Match.findByIdAndUpdate(
        req.params.matchId,
        { status },
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
      logger.error("Update Match Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating match status",
      });
    }
  }
);

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

      const game = match.games.find(
        (g) => g.gameNumber === parseInt(gameNumber)
      );
      if (!game) {
        return res.status(404).json({
          success: false,
          message: "Game not found",
        });
      }

      // Update game stats
      game.stats.team1 = team1Stats;
      game.stats.team2 = team2Stats;
      game.winner = winner;
      game.status = "completed";

      // Update match scores
      if (winner) {
        if (winner.toString() === match.team1.id.toString()) {
          match.team1.score += 1;
        } else {
          match.team2.score += 1;
        }
      }

      // Check if match is completed
      const gamesNeededToWin = Math.ceil(match.bestOf / 2);
      if (
        match.team1.score >= gamesNeededToWin ||
        match.team2.score >= gamesNeededToWin
      ) {
        match.status = "completed";
        match.winner =
          match.team1.score > match.team2.score
            ? match.team1.id
            : match.team2.id;
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

// Get matches by tournament
router.get(
  "/tournament/:tournamentId",
  protect,
  async (req: Request, res: Response) => {
    try {
      const matches = await Match.find({ tournament: req.params.tournamentId })
        .populate("team1.id")
        .populate("team2.id")
        .populate("winner")
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
      teamType,
      bestOf,
      team1,
      team2,
      nextMatch,
    } = req.body;

    const match = await Match.create({
      tournament,
      round,
      matchNumber,
      teamType,
      bestOf,
      team1,
      team2,
      nextMatch,
      games: Array.from({ length: bestOf }, (_, i) => ({
        gameNumber: i + 1,
        status: "pending",
        stats: {
          team1: [],
          team2: [],
        },
      })),
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

export default router;
