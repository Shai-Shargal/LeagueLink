import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Tournament } from "../../types";
import TournamentInfoSection from "./TournamentInfoSection";
import TournamentBracketSection from "./TournamentBracketSection";

interface TournamentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onUpdateMatch: (match: any) => void;
}

const TournamentDetailsDialog: React.FC<TournamentDetailsDialogProps> = ({
  open,
  onClose,
  tournament,
  onUpdateMatch,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgb(30, 41, 59)",
          color: "white",
          minHeight: "80vh",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 20,
          fontWeight: 600,
          textAlign: "center",
          padding: "8px",
          color: "white",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "40px",
        }}
      >
        <Box sx={{ flex: 1 }}></Box>
        <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
          {tournament?.name}
        </span>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={onClose} sx={{ color: "white", padding: "4px" }}>
            <CloseIcon sx={{ fontSize: "1.2rem" }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 3,
          pt: 2,
          flex: 1,
          overflow: "auto",
          backgroundColor: "rgb(30, 41, 59)",
        }}
      >
        {tournament && (
          <>
            <TournamentInfoSection tournament={tournament} />
            <TournamentBracketSection
              tournament={tournament}
              onUpdateMatch={onUpdateMatch}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDetailsDialog;
