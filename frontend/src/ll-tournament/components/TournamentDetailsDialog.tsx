import React, { useState } from "react";
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
import MatchBox from "./matchbox";
import { Tournament } from "../../services/tournamentService";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isGuest?: boolean;
}

interface TournamentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: Omit<Tournament, "_id"> & { id: string };
}

interface Match {
  id: string;
  position: { x: number; y: number };
}

const DroppableBox: React.FC<{
  matches: Match[];
  onRemoveMatch: (id: string) => void;
  tournamentUsers: User[];
}> = ({ matches, onRemoveMatch, tournamentUsers }) => {
  return (
    <Box
      sx={{
        flex: 1.5,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        border: "1.5px dashed #444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#aaa",
        fontSize: 26,
        fontWeight: 600,
        letterSpacing: 1,
        minHeight: "60vh",
        p: 3,
        transition: "all 0.2s ease",
        position: "relative",
        "&:hover": {
          borderColor: "#666",
          background: "rgba(255,255,255,0.05)",
        },
      }}
    >
      {matches.length === 0 ? (
        <Typography>Drop matches here</Typography>
      ) : (
        matches.map((match) => (
          <Box
            key={match.id}
            sx={{
              position: "relative",
              m: 1,
            }}
          >
            <MatchBox
              id={match.id}
              onRemove={() => onRemoveMatch(match.id)}
              position={match.position}
              tournamentUsers={tournamentUsers}
            />
          </Box>
        ))
      )}
    </Box>
  );
};

const TournamentDetailsDialog: React.FC<TournamentDetailsDialogProps> = ({
  open,
  onClose,
  tournament,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [tournamentUsers, setTournamentUsers] = useState<User[]>([]);

  const calculateNewMatchPosition = (): { x: number; y: number } => {
    if (matches.length === 0) {
      return { x: 50, y: 50 }; // Center position for first match
    }

    // Calculate grid-like positions
    const gridSize = Math.ceil(Math.sqrt(matches.length + 1));
    const newIndex = matches.length;
    const row = Math.floor(newIndex / gridSize);
    const col = newIndex % gridSize;

    // Calculate percentage positions (20% padding from edges)
    const x = 20 + (col * 60) / (gridSize - 1);
    const y = 20 + (row * 60) / (gridSize - 1);

    return { x, y };
  };

  const handleCreateMatch = () => {
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      position: calculateNewMatchPosition(),
    };
    setMatches((prev) => [...prev, newMatch]);
    setCanUndo(true);
  };

  const handleRemoveMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((match) => match.id !== matchId));
    setCanUndo(matches.length > 1);
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
      // If user is already selected, remove them
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      }
      // Otherwise add them
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

            <DroppableBox
              matches={matches}
              onRemoveMatch={handleRemoveMatch}
              tournamentUsers={tournamentUsers}
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
