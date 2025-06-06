import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import TournamentToolbar from "./TournamentToolbar";
import TournamentUsers from "./TournamentUsers";
import TournamentDropZone from "./TournamentDropZone";
import { Tournament } from "../../services/tournamentService";
import api from "../../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isGuest?: boolean;
}

interface Match {
  id: string;
  position: { x: number; y: number };
  round: number;
  matchNumber: number;
  team1: {
    players: Array<{
      userId: string;
      username: string;
      profilePicture?: string;
    }>;
    score: number;
  };
  team2: {
    players: Array<{
      userId: string;
      username: string;
      profilePicture?: string;
    }>;
    score: number;
  };
  bestOf: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  gameScores: Array<{
    team1Score: number;
    team2Score: number;
  }>;
}

interface Connection {
  start: string;
  end: string;
}

interface TournamentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: Omit<Tournament, "_id"> & { id: string };
}

const TournamentDetailsDialog: React.FC<TournamentDetailsDialogProps> = ({
  open,
  onClose,
  tournament,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [tournamentUsers, setTournamentUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchTournamentMatches = async () => {
      if (open && tournament.id) {
        console.log("Fetching matches for tournament:", tournament.id);
        try {
          const response = await api.get(
            `/tournaments/${tournament.id}/matches`
          );
          console.log("Matches response:", response.data);
          if (response.data.success) {
            // Transform the matches to match our frontend interface
            const transformedMatches = response.data.data.map((match: any) => ({
              id: match._id,
              position: match.position,
              round: match.round,
              matchNumber: match.matchNumber,
              team1: match.team1,
              team2: match.team2,
              bestOf: match.bestOf,
              status: match.status,
              gameScores: match.gameScores,
            }));
            console.log("Transformed matches:", transformedMatches);
            setMatches(transformedMatches);
          }
        } catch (error) {
          console.error("Error fetching tournament matches:", error);
        }
      }
    };

    fetchTournamentMatches();
  }, [open, tournament.id]);

  const handleCreateMatch = () => {
    const round = Math.floor(matches.length / 2) + 1;
    const matchNumber = matches.length + 1;

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      position: {
        x: round * 200, // Space matches horizontally based on round
        y: (matchNumber - 1) * 150, // Space matches vertically
      },
      round,
      matchNumber,
      team1: {
        players: [],
        score: 0,
      },
      team2: {
        players: [],
        score: 0,
      },
      bestOf: 1,
      status: "PENDING",
      gameScores: [],
    };
    setMatches((prev) => [...prev, newMatch]);
    setCanUndo(true);
  };

  const handleMatchAdd = (match: Match) => {
    if (!matches.some((m) => m.id === match.id)) {
      setMatches((prev) => [...prev, match]);
      setCanUndo(true);
    }
  };

  const handleMatchMove = (
    matchId: string,
    position: { x: number; y: number }
  ) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId ? { ...match, position } : match
      )
    );
  };

  const handleMatchRemove = (matchId: string) => {
    setMatches((prev) => prev.filter((match) => match.id !== matchId));
    setConnections((prev) =>
      prev.filter((conn) => conn.start !== matchId && conn.end !== matchId)
    );
    setCanUndo(matches.length > 1);
  };

  const handleConnectionAdd = (connection: Connection) => {
    // Only add connection if it doesn't already exist
    if (
      !connections.some(
        (conn) => conn.start === connection.start && conn.end === connection.end
      )
    ) {
      setConnections((prev) => [...prev, connection]);
    }
  };

  const handleUndo = () => {
    if (matches.length > 0) {
      setMatches((prev) => prev.slice(0, -1));
      setCanUndo(matches.length > 1);
    }
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    setCanRedo(false);
  };

  const handleUserSelect = (user: User) => {
    setTournamentUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          color: "#fff",
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {tournament.name}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            height: "100%",
          }}
        >
          {/* Left side: Toolbar + Drop area */}
          <Box
            sx={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 2,
                p: 1,
              }}
            >
              <TournamentToolbar
                onCreateMatch={handleCreateMatch}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </Box>
            <TournamentDropZone
              matches={matches}
              tournamentUsers={tournamentUsers}
              tournamentId={tournament.id}
              onMatchAdd={handleMatchAdd}
              onMatchRemove={handleMatchRemove}
              onConnectionAdd={handleConnectionAdd}
              onMatchMove={handleMatchMove}
            />
          </Box>
          {/* Right side: Users list */}
          <Box
            sx={{
              flex: 1,
              alignSelf: "flex-start",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <TournamentUsers
              channelId={tournament.channelId}
              onUserSelect={handleUserSelect}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDetailsDialog;
