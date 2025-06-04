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
import { Tournament } from "../../services/tournamentService";

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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleCreateMatch = () => {
    // TODO: Implement match creation logic
    console.log("Create match clicked");
  };

  const handleUndo = () => {
    // TODO: Implement undo logic
    console.log("Undo clicked");
  };

  const handleRedo = () => {
    // TODO: Implement redo logic
    console.log("Redo clicked");
  };

  const handleUserSelect = (user: any) => {
    // TODO: Implement user selection logic
    console.log("User selected:", user);
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                mb: 1,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 2,
                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.10)",
                border: "1px solid rgba(255,255,255,0.05)",
                p: 0.5,
                width: "100%",
                maxWidth: 280,
                flex: 0,
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
            <Box
              sx={{
                flex: 2,
                minHeight: "44vh",
                background: "rgba(255,255,255,0.02)",
                border: "1.5px dashed #444",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 1,
              }}
            >
              Matches will be displayed here soon
            </Box>
          </Box>
          <TournamentUsers
            channelId={tournament.channelId}
            onUserSelect={handleUserSelect}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDetailsDialog;
