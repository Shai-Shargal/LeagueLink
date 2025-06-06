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
import TournamentDropZone from "./TournamentDropZone";
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
}

const TournamentDetailsDialog: React.FC<TournamentDetailsDialogProps> = ({
  open,
  onClose,
  tournament,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [tournamentUsers, setTournamentUsers] = useState<User[]>([]);

  const handleCreateMatch = () => {
    const newMatch: Match = {
      id: `match-${Date.now()}`,
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
            <TournamentDropZone />
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
