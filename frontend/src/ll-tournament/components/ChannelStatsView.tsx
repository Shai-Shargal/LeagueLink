import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import channelService from "../../services/channelService";
import api from "../../services/api";

interface PlayerStats {
  userId: string;
  username: string;
  profilePicture?: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  tournamentsParticipated: number;
  tournamentsWon: number;
  averageScore: number;
  playerStats: Record<
    string,
    { total: number; matches: number; average: number }
  >;
}

interface ChannelStatsViewProps {
  channelId: string;
  onBackToTournaments?: () => void;
}

const ChannelStatsView: React.FC<ChannelStatsViewProps> = ({
  channelId,
  onBackToTournaments,
}) => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChannelStats();
  }, [channelId]);

  const loadChannelStats = async () => {
    try {
      setLoading(true);
      console.log("Loading channel stats for channelId:", channelId);

      // Get channel details to get member list
      console.log("Fetching channel details...");
      const channelResponse = await channelService.getChannelDetails(channelId);
      const channel = channelResponse.data;
      console.log("Channel details:", channel);

      if (!channel || !channel.members) {
        throw new Error("Channel not found or no members");
      }

      // Get all tournaments for this channel
      console.log("Fetching tournaments...");
      const tournamentsResponse = await api.get(
        `/tournaments/channel/${channelId}`
      );
      const tournaments = tournamentsResponse.data.data || [];
      console.log("Tournaments:", tournaments);

      // Calculate stats for each player
      const playerStats: PlayerStats[] = [];

      for (const member of channel.members) {
        const playerStat: PlayerStats = {
          userId: member._id,
          username: member.username,
          profilePicture: member.profilePicture,
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          tournamentsParticipated: 0,
          tournamentsWon: 0,
          averageScore: 0,
          playerStats: {},
        };

        // Count tournaments participated
        for (const tournament of tournaments) {
          const isParticipant = tournament.participants?.some(
            (p: any) => p.userId === member._id
          );

          if (isParticipant) {
            playerStat.tournamentsParticipated++;

            // Check if won the tournament
            if (tournament.winner === member._id) {
              playerStat.tournamentsWon++;
            }
          }
        }

        // Get match statistics for this player
        console.log(
          `Fetching matches for player ${member.username} (${member._id})...`
        );
        const matchesResponse = await api.get(`/matches/player/${member._id}`);
        const playerMatches = matchesResponse.data.data || [];
        console.log(`Player ${member.username} matches:`, playerMatches);

        let totalScore = 0;
        let matchCount = 0;

        for (const match of playerMatches) {
          // Only count matches from tournaments in this channel
          const isChannelMatch = tournaments.some(
            (t: any) => t._id === match.tournamentId
          );

          if (isChannelMatch) {
            playerStat.totalMatches++;
            matchCount++;

            // Determine if player won this match
            const isTeam1 = match.team1.players.some(
              (p: any) => p.userId === member._id
            );
            const isTeam2 = match.team2.players.some(
              (p: any) => p.userId === member._id
            );

            if (isTeam1 || isTeam2) {
              const team1Score = match.gameScores.reduce(
                (sum: number, game: any) => sum + game.team1Score,
                0
              );
              const team2Score = match.gameScores.reduce(
                (sum: number, game: any) => sum + game.team2Score,
                0
              );

              totalScore += isTeam1 ? team1Score : team2Score;

              // Process player-specific stats
              if (match.stats) {
                Object.entries(match.stats).forEach(
                  ([statName, statData]: [string, any]) => {
                    if (statData.playerId === member._id) {
                      if (!playerStat.playerStats[statName]) {
                        playerStat.playerStats[statName] = {
                          total: 0,
                          matches: 0,
                          average: 0,
                        };
                      }
                      playerStat.playerStats[statName].total += statData.value;
                      playerStat.playerStats[statName].matches += 1;
                    }
                  }
                );
              }

              if (match.winner) {
                // Check if the winner is in team1 or team2
                const isWinnerInTeam1 = match.team1.players.some(
                  (p: any) => p.userId === match.winner
                );
                const isWinnerInTeam2 = match.team2.players.some(
                  (p: any) => p.userId === match.winner
                );

                if (
                  (isTeam1 && isWinnerInTeam1) ||
                  (isTeam2 && isWinnerInTeam2)
                ) {
                  playerStat.wins++;
                } else {
                  playerStat.losses++;
                }
              }
            }
          }
        }

        if (matchCount > 0) {
          playerStat.averageScore = totalScore / matchCount;
        }

        if (playerStat.totalMatches > 0) {
          playerStat.winRate =
            (playerStat.wins / playerStat.totalMatches) * 100;
        }

        // Calculate averages for player stats
        Object.values(playerStat.playerStats).forEach((stat) => {
          if (stat.matches > 0) {
            stat.average = stat.total / stat.matches;
          }
        });

        playerStats.push(playerStat);
      }

      setPlayers(playerStats);
    } catch (err: any) {
      console.error("Error loading channel stats:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError(
        `Failed to load channel statistics: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const chartData = players.map((player) => ({
    name: player.username,
    winRate: player.winRate,
    totalMatches: player.totalMatches,
    tournamentsWon: player.tournamentsWon,
  }));

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ color: "#fff" }}>
          Channel Statistics
        </Typography>
        {onBackToTournaments && (
          <Button
            variant="outlined"
            onClick={onBackToTournaments}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Back to Tournaments
          </Button>
        )}
      </Box>

      {/* Chart Section */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <Typography variant="h6" gutterBottom sx={{ color: "#fff", mb: 2 }}>
          Win Rate Comparison
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            />
            <Bar dataKey="winRate" fill="#9C27B0" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Player Stats Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                Player
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                Matches
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                Win Rate
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                W wins
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                Losses
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                Tournaments Won
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                Avg Score
              </TableCell>
              {players.length > 0 &&
                Object.keys(players[0].playerStats).length > 0 &&
                Object.keys(players[0].playerStats).map((statName) => (
                  <TableCell
                    key={statName}
                    sx={{ color: "#fff", fontWeight: 600 }}
                  >
                    {statName}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow
                key={player.userId}
                sx={{
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={player.profilePicture}
                      sx={{ width: 32, height: 32 }}
                    >
                      {player.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography sx={{ color: "#fff" }}>
                      {player.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {player.totalMatches}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {player.winRate.toFixed(1)}%
                </TableCell>
                <TableCell sx={{ color: "#4CAF50", fontWeight: 600 }}>
                  {player.wins}
                </TableCell>
                <TableCell sx={{ color: "#F44336", fontWeight: 600 }}>
                  {player.losses}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {player.tournamentsWon}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {player.averageScore.toFixed(1)}
                </TableCell>
                {Object.keys(player.playerStats).length > 0 &&
                  Object.keys(players[0].playerStats).map((statName) => {
                    const stat = player.playerStats[statName];
                    return (
                      <TableCell key={statName} sx={{ color: "#fff" }}>
                        {stat
                          ? `${stat.total}/${stat.matches} (${stat.average.toFixed(1)})`
                          : "-"}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChannelStatsView;
