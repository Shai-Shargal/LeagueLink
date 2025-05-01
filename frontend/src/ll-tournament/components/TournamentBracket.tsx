import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  SportsSoccer as SoccerIcon,
  SportsBasketball as BasketballIcon,
  SportsFootball as FootballIcon,
  SportsHockey as HockeyIcon,
  SportsTennis as TennisIcon,
  SportsVolleyball as VolleyballIcon,
  SportsGolf as GolfIcon,
  SportsCricket as CricketIcon,
  SportsRugby as RugbyIcon,
  SportsBaseball as BaseballIcon,
} from "@mui/icons-material";
import { Tournament, TournamentParticipant, Match } from "../types";

interface TournamentBracketProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
}

const SPORTS_ICONS: { [key: string]: React.ReactNode } = {
  soccer: <SoccerIcon />,
  basketball: <BasketballIcon />,
  football: <FootballIcon />,
  hockey: <HockeyIcon />,
  tennis: <TennisIcon />,
  volleyball: <VolleyballIcon />,
  golf: <GolfIcon />,
  cricket: <CricketIcon />,
  rugby: <RugbyIcon />,
  baseball: <BaseballIcon />,
};

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournament,
  onUpdateTournament,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sportType, setSportType] = useState<string>("soccer");

  const generateBracket = async () => {
    if (!tournament.structure) {
      console.error("Tournament structure is not defined");
      return;
    }

    const newMatches: Match[] = [];
    let matchNumber = 1;

    // Generate group stage matches
    for (let group = 0; group < tournament.structure.groups; group++) {
      const groupParticipants = tournament.participants.slice(
        group * tournament.structure.participantsPerGroup,
        (group + 1) * tournament.structure.participantsPerGroup
      );

      // Create round-robin matches within the group
      for (let i = 0; i < groupParticipants.length; i++) {
        for (let j = i + 1; j < groupParticipants.length; j++) {
          newMatches.push({
            id: `group-${group}-${matchNumber}`,
            round: group + 1,
            matchNumber: matchNumber++,
            team1: groupParticipants[i],
            team2: groupParticipants[j],
          });
        }
      }
    }

    // Generate knockout stage matches
    if (tournament.structure?.knockoutRounds) {
      const knockoutRounds = tournament.structure.knockoutRounds;
      knockoutRounds.forEach((round, index) => {
        const numMatches = Math.pow(2, knockoutRounds.indexOf(round));
        for (let i = 0; i < numMatches; i++) {
          newMatches.push({
            id: `${round.toLowerCase()}-${matchNumber}`,
            round: (tournament.structure?.groups || 0) + index + 1,
            matchNumber: matchNumber++,
            team1: null as any, // We'll set these later when teams are determined
            team2: null as any,
          });
        }
      });
    }

    setMatches(newMatches);

    // Save the generated matches to the backend
    try {
      const updatedTournament = {
        ...tournament,
        matches: newMatches,
      };
      await onUpdateTournament(updatedTournament);
    } catch (error) {
      console.error("Failed to save generated matches:", error);
    }
  };

  const generateEmptyBracket = async () => {
    const newMatches: Match[] = [];
    let matchNumber = 1;

    // Calculate number of rounds needed based on number of participants
    const numParticipants = tournament.participants.length;
    const numRounds = Math.ceil(Math.log2(numParticipants));

    // Generate matches for each round
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        newMatches.push({
          id: `round-${round}-${matchNumber}`,
          round: round,
          matchNumber: matchNumber++,
          team1: null as any,
          team2: null as any,
          position: {
            x: (round - 1) * 220,
            y: i * 100,
          },
        });
      }
    }

    setMatches(newMatches);

    // Save the generated matches to the backend
    try {
      const updatedTournament = {
        ...tournament,
        matches: newMatches,
      };
      await onUpdateTournament(updatedTournament);
    } catch (error) {
      console.error("Failed to save generated matches:", error);
    }
  };

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleUpdateScore = async (
    match: Match,
    team: "team1" | "team2",
    score: number
  ) => {
    const updatedMatch = {
      ...match,
      [team === "team1" ? "score1" : "score2"]: score,
      winner:
        score > (team === "team1" ? match.score2 || 0 : match.score1 || 0)
          ? match[team]
          : match[team === "team1" ? "team2" : "team1"],
    };
    const updatedMatches = matches.map((m) =>
      m.id === match.id ? updatedMatch : m
    );
    setMatches(updatedMatches);

    // Update the tournament in the backend
    try {
      const updatedTournament = {
        ...tournament,
        matches: updatedMatches,
      };
      await onUpdateTournament(updatedTournament);
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const renderMatch = (match: Match) => (
    <Paper
      key={match.id}
      sx={{
        p: 2,
        mb: 2,
        cursor: "pointer",
        backgroundColor:
          match.team1 === null && match.team2 === null
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(255, 255, 255, 0.05)",
        border:
          match.team1 === null && match.team2 === null
            ? "1px dashed rgba(255, 255, 255, 0.2)"
            : "none",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
      onClick={() => handleMatchClick(match)}
    >
      <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
        Round {match.round} - Match {match.matchNumber}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "white" }}>
            {match.team1?.username || "TBD"}
          </Typography>
          {match.score1 !== undefined && (
            <TextField
              type="number"
              value={match.score1}
              onChange={(e) =>
                handleUpdateScore(match, "team1", parseInt(e.target.value))
              }
              size="small"
              sx={{ width: 60, mt: 1 }}
              InputProps={{ sx: { color: "white" } }}
            />
          )}
        </Box>
        <Typography sx={{ color: "white", mx: 2 }}>vs</Typography>
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Typography sx={{ color: "white" }}>
            {match.team2?.username || "TBD"}
          </Typography>
          {match.score2 !== undefined && (
            <TextField
              type="number"
              value={match.score2}
              onChange={(e) =>
                handleUpdateScore(match, "team2", parseInt(e.target.value))
              }
              size="small"
              sx={{ width: 60, mt: 1 }}
              InputProps={{ sx: { color: "white" } }}
            />
          )}
        </Box>
      </Box>
      {match.winner && (
        <Typography
          variant="caption"
          sx={{ color: "success.main", mt: 1, display: "block" }}
        >
          Winner: {match.winner.username}
        </Typography>
      )}
      {match.team1 === null && match.team2 === null && (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mt: 1,
            display: "block",
            fontStyle: "italic",
          }}
        >
          Waiting for previous round results
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ color: "white" }}>
          {tournament.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateEmptyBracket}
            sx={{ mr: 2 }}
          >
            Generate Empty Bracket
          </Button>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "white" }}>Sport Type</InputLabel>
            <Select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              sx={{ color: "white" }}
            >
              {Object.keys(SPORTS_ICONS).map((sport) => (
                <MenuItem key={sport} value={sport}>
                  {SPORTS_ICONS[sport]}{" "}
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={generateBracket}
            sx={{
              background: "linear-gradient(45deg, #C680E3, #9333EA)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Generate Bracket
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Group Stage */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Group Stage
          </Typography>
          {matches
            .filter(
              (match) => match.round <= (tournament.structure?.groups || 0)
            )
            .map(renderMatch)}
        </Box>

        {/* Knockout Stage */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Knockout Stage
          </Typography>
          {matches
            .filter(
              (match) => match.round > (tournament.structure?.groups || 0)
            )
            .map(renderMatch)}
        </Box>
      </Box>

      {/* Match Details Dialog */}
      <Dialog
        open={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ color: "white", backgroundColor: "rgba(15, 23, 42, 0.95)" }}
        >
          Match Details
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "rgba(15, 23, 42, 0.95)" }}>
          {selectedMatch && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                {selectedMatch.round <= (tournament.structure?.groups || 0)
                  ? `Group ${String.fromCharCode(64 + selectedMatch.round)}`
                  : `Round ${
                      selectedMatch.round - (tournament.structure?.groups || 0)
                    }`}{" "}
                - Match {selectedMatch.matchNumber}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: "white", mb: 1 }}>
                    {selectedMatch.team1?.username || "TBD"}
                  </Typography>
                  <TextField
                    type="number"
                    label="Score"
                    value={selectedMatch.score1 || ""}
                    onChange={(e) =>
                      handleUpdateScore(
                        selectedMatch,
                        "team1",
                        parseInt(e.target.value)
                      )
                    }
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: "white", mb: 1 }}>
                    {selectedMatch.team2?.username || "TBD"}
                  </Typography>
                  <TextField
                    type="number"
                    label="Score"
                    value={selectedMatch.score2 || ""}
                    onChange={(e) =>
                      handleUpdateScore(
                        selectedMatch,
                        "team2",
                        parseInt(e.target.value)
                      )
                    }
                    fullWidth
                  />
                </Box>
              </Box>
              {selectedMatch.winner && (
                <Typography sx={{ color: "success.main" }}>
                  Winner: {selectedMatch.winner.username}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "rgba(15, 23, 42, 0.95)" }}>
          <Button
            onClick={() => setSelectedMatch(null)}
            sx={{ color: "white" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentBracket;
