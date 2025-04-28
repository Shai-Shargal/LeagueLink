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
import { Tournament, TournamentParticipant } from "../types";

interface Match {
  id: string;
  round: string;
  matchNumber: number;
  team1?: TournamentParticipant;
  team2?: TournamentParticipant;
  score1?: number;
  score2?: number;
  winner?: TournamentParticipant;
}

interface TournamentBracketProps {
  tournament: Tournament;
  onUpdateMatch: (match: Match) => void;
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
  onUpdateMatch,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sportType, setSportType] = useState<string>("soccer");

  const generateBracket = () => {
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
            round: `Group ${String.fromCharCode(65 + group)}`,
            matchNumber: matchNumber++,
            team1: groupParticipants[i],
            team2: groupParticipants[j],
          });
        }
      }
    }

    // Generate knockout stage matches
    tournament.structure.knockoutRounds.forEach((round) => {
      const numMatches = Math.pow(
        2,
        tournament.structure.knockoutRounds.indexOf(round)
      );
      for (let i = 0; i < numMatches; i++) {
        newMatches.push({
          id: `${round.toLowerCase()}-${matchNumber}`,
          round,
          matchNumber: matchNumber++,
        });
      }
    });

    setMatches(newMatches);
  };

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleUpdateScore = (
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
    setMatches(matches.map((m) => (m.id === match.id ? updatedMatch : m)));
    onUpdateMatch(updatedMatch);
  };

  const renderMatch = (match: Match) => (
    <Paper
      key={match.id}
      sx={{
        p: 2,
        mb: 2,
        cursor: "pointer",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
      onClick={() => handleMatchClick(match)}
    >
      <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
        {match.round} - Match {match.matchNumber}
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
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "white" }}>Sport Type</InputLabel>
            <Select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              sx={{ color: "white" }}
            >
              {Object.keys(SPORTS_ICONS).map((sport) => (
                <MenuItem key={sport} value={sport}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {SPORTS_ICONS[sport]}
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </Box>
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
            .filter((match) => match.round.startsWith("Group"))
            .map(renderMatch)}
        </Box>

        {/* Knockout Stage */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Knockout Stage
          </Typography>
          {matches
            .filter((match) => !match.round.startsWith("Group"))
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
                {selectedMatch.round} - Match {selectedMatch.matchNumber}
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
