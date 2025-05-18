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

      // Update match stats
      if (team1Stats) match.stats.team1 = team1Stats;
      if (team2Stats) match.stats.team2 = team2Stats;

      // Update match scores
      if (winner) {
        if (winner.toString() === match.team1.players[0].userId.toString()) {
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
        match.winner = new mongoose.Types.ObjectId(
          match.team1.score > match.team2.score
            ? match.team1.players[0].userId
            : match.team2.players[0].userId
        );
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

    console.log("Creating match with data:", {
      tournament,
      round,
      matchNumber,
      teamType,
      bestOf,
      team1,
      team2,
    });

    const match = await Match.create({
      tournament: new mongoose.Types.ObjectId(tournament),
      round,
      matchNumber,
      teamType,
      bestOf,
      team1: {
        type: team1.type,
        id: new mongoose.Types.ObjectId(team1.id),
        isGuest: team1.isGuest || false,
        score: team1.score || 0,
        players:
          team1.players?.map((p: any) => ({
            id: new mongoose.Types.ObjectId(p.id),
            isGuest: p.isGuest || false,
          })) || [],
      },
      team2: {
        type: team2.type,
        id: new mongoose.Types.ObjectId(team2.id),
        isGuest: team2.isGuest || false,
        score: team2.score || 0,
        players:
          team2.players?.map((p: any) => ({
            id: new mongoose.Types.ObjectId(p.id),
            isGuest: p.isGuest || false,
          })) || [],
      },
      nextMatch: nextMatch ? new mongoose.Types.ObjectId(nextMatch) : null,
      games: Array.from({ length: bestOf }, (_, i) => ({
        gameNumber: i + 1,
        status: "pending",
        stats: {
          team1: [],
          team2: [],
        },
      })),
    });

    // Add match to tournament
    await Tournament.findByIdAndUpdate(tournament, {
      $push: { matches: match._id },
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

    const { round, matchNumber, bestOf, team1, team2, nextMatch, status } =
      req.body;

    // Update match fields
    if (round !== undefined) match.round = round;
    if (matchNumber !== undefined) match.matchNumber = matchNumber;
    if (bestOf) match.bestOf = bestOf;
    if (team1) match.team1 = team1;
    if (team2) match.team2 = team2;
    if (nextMatch) match.nextMatch = new mongoose.Types.ObjectId(nextMatch);
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

    // Remove match from tournament
    await Tournament.findByIdAndUpdate(match.tournament, {
      $pull: { matches: match._id },
    });

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

// Get all matches (optionally filter by status)
router.get("/", protect, async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const matches = await Match.find(filter)
      .populate("team1.id")
      .populate("team2.id")
      .populate("winner")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: matches });
  } catch (error) {
    logger.error("Get All Matches Error:", error);
    res.status(500).json({ success: false, message: "Error fetching matches" });
  }
});

// Get all matches for a player
router.get(
  "/player/:playerId",
  protect,
  async (req: Request, res: Response) => {
    try {
      const playerId = req.params.playerId;
      const matches = await Match.find({
        $or: [
          { "team1.id": playerId },
          { "team2.id": playerId },
          { "team1.players.id": playerId },
          { "team2.players.id": playerId },
        ],
      })
        .populate("team1.id")
        .populate("team2.id")
        .populate("winner")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: matches });
    } catch (error) {
      logger.error("Get Player Matches Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching player matches" });
    }
  }
);

// General update for a match
router.patch("/:id", protect, async (req: Request, res: Response) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("team1.id")
      .populate("team2.id")
      .populate("winner");
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }
    res.json({ success: true, data: match });
  } catch (error) {
    logger.error("General Update Match Error:", error);
    res.status(500).json({ success: false, message: "Error updating match" });
  }
});

// Bulk create matches for a tournament
router.post(
  "/tournament/:tournamentId/bulk",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { tournamentId } = req.params;
      const { matches } = req.body;

      // Validate tournament exists and user has permission
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found",
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
          message: "Not authorized to create matches for this tournament",
        });
      }

      // Create all matches without nextMatchId first
      const createdMatches = await Promise.all(
        matches.map(
          async (matchData: {
            round: number;
            matchNumber: number;
            bestOf: number;
            team1: { players: any[] };
            team2: { players: any[] };
            position: number;
          }) => {
            const match = await Match.create({
              tournament: tournamentId,
              round: matchData.round,
              matchNumber: matchData.matchNumber,
              bestOf: matchData.bestOf,
              team1: {
                players: matchData.team1.players || [],
                score: 0,
              },
              team2: {
                players: matchData.team2.players || [],
                score: 0,
              },
              position: matchData.position,
              stats: {},
            });

            // Add match to tournament
            await Tournament.findByIdAndUpdate(tournamentId, {
              $push: { matches: match._id },
            });

            return match;
          }
        )
      );

      // Create a map of frontend IDs to MongoDB IDs
      const idMap = new Map(
        matches.map((match: { id: string }, index: number) => [
          match.id,
          createdMatches[index]._id,
        ])
      );

      // Update matches with nextMatchId relationships
      await Promise.all(
        createdMatches.map(async (match, index) => {
          const originalMatch = matches[index];
          if (originalMatch.nextMatchId) {
            const nextMatchId = idMap.get(originalMatch.nextMatchId);
            if (nextMatchId) {
              match.nextMatch = nextMatchId;
              await match.save();
            }
          }
        })
      );

      res.status(201).json({
        success: true,
        data: createdMatches,
      });
    } catch (error) {
      logger.error("Bulk Create Matches Error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating matches",
      });
    }
  }
);

// Update match stats and results
router.patch(
  "/:matchId/stats",
  protect,
  async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const { stats, team1Score, team2Score, winner } = req.body;

      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({
          success: false,
          message: "Match not found",
        });
      }

      // Validate tournament exists and user has permission
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
          message: "Not authorized to update match stats",
        });
      }

      // Update match stats
      if (stats) {
        match.stats = stats;
      }

      // Update scores
      if (team1Score !== undefined) {
        match.team1.score = team1Score;
      }
      if (team2Score !== undefined) {
        match.team2.score = team2Score;
      }

      // Update winner if provided
      if (winner) {
        match.winner = winner;
      }

      // Check if match is completed based on bestOf
      const gamesNeededToWin = Math.ceil(match.bestOf / 2);
      if (
        match.team1.score >= gamesNeededToWin ||
        match.team2.score >= gamesNeededToWin
      ) {
        match.status = "completed";
        if (!match.winner) {
          match.winner =
            match.team1.score > match.team2.score
              ? match.team1.players[0].userId
              : match.team2.players[0].userId;
        }
      } else {
        match.status = "in_progress";
      }

      await match.save();

      res.json({
        success: true,
        data: match,
      });
    } catch (error) {
      logger.error("Update Match Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating match stats",
      });
    }
  }
);

export default router;
