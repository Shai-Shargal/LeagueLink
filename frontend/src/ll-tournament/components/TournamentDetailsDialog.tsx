import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Paper,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  SportsTennis as SportsIcon,
} from "@mui/icons-material";

interface TournamentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: {
    id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    createdBy?: {
      username: string;
      profilePicture?: string;
    };
    participantsCount?: number;
    status?: "upcoming" | "in_progress" | "completed";
  };
}

const TournamentDetailsDialog: React.FC<TournamentDetailsDialogProps> = ({
  open,
  onClose,
  tournament,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          bg: "rgba(76, 175, 80, 0.1)",
          color: "#4CAF50",
          border: "rgba(76, 175, 80, 0.3)",
        };
      case "in_progress":
        return {
          bg: "rgba(255, 152, 0, 0.1)",
          color: "#FF9800",
          border: "rgba(255, 152, 0, 0.3)",
        };
      case "completed":
        return {
          bg: "rgba(33, 150, 243, 0.1)",
          color: "#2196F3",
          border: "rgba(33, 150, 243, 0.3)",
        };
      default:
        return {
          bg: "rgba(76, 175, 80, 0.1)",
          color: "#4CAF50",
          border: "rgba(76, 175, 80, 0.3)",
        };
    }
  };

  const statusStyle = getStatusColor(tournament.status || "upcoming");
  const status = tournament.status || "upcoming";

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
          borderRadius: 2,
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", p: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TrophyIcon sx={{ color: "#FFD700", fontSize: 32 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {tournament.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                size="small"
                sx={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ color: "#9C27B0", fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {tournament.participantsCount || 0} Participants
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "rgba(255,255,255,0.05)",
            p: 3,
            borderRadius: 2,
            height: "100%",
            minHeight: "600px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.3)" }}>
            Future Component Space
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2 }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.3)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.5)",
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<SportsIcon />}
          sx={{
            backgroundColor: "#2196F3",
            "&:hover": {
              backgroundColor: "#1976D2",
            },
          }}
        >
          View Matches
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TournamentDetailsDialog;
