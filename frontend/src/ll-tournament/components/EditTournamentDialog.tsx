import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
} from "@mui/material";
import { Tournament, Match } from "../types";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";

interface EditTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournament: Tournament) => void;
  tournament: Tournament;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  isUpdating: boolean;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 600;
const GAMES_AREA_HEIGHT = 400;
const BASE_BOX_HEIGHT = 100;
const BASE_BOX_WIDTH = 200;
const MATCH_VERTICAL_GAP = 16;
const ROUND_HORIZONTAL_GAP = 60;
const INITIAL_TOP_MARGIN = 40;

const EditTournamentDialog: React.FC<EditTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  tournament,
  onTournamentChange,
  isUpdating,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<Match[]>(tournament.matches || []);
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!tournament.name?.trim()) {
      newErrors.name = "Tournament name is required";
    }
    if (!tournament.location?.trim()) {
      newErrors.location = "Location is required";
    }
    if (!tournament.date) {
      newErrors.date = "Date is required";
    }
    if (!tournament.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...tournament,
        matches: matches,
      });
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setErrors({});
      onClose();
    }
  };

  const addEmptyMatch = (round: number) => {
    const newMatch: Match = {
      id: uuidv4(),
      round: round,
      matchNumber: matches.filter((m) => m.round === round).length + 1,
      team1: null as any,
      team2: null as any,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y:
          matches.filter((m) => m.round === round).length *
            (BASE_BOX_HEIGHT + MATCH_VERTICAL_GAP) +
          INITIAL_TOP_MARGIN,
      },
    };
    setMatches([...matches, newMatch]);
  };

  const removeMatch = (matchId: string) => {
    setMatches(matches.filter((m) => m.id !== matchId));
  };

  const handleDragStart = (match: Match) => {
    setDraggedMatch(match);
  };

  const handleDragEnd = () => {
    setDraggedMatch(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedMatch) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the round based on x position
    const round = Math.floor(x / ROUND_HORIZONTAL_GAP) + 1;

    // Update the match position
    const updatedMatch = {
      ...draggedMatch,
      round: round,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y: y - INITIAL_TOP_MARGIN,
      },
    };

    setMatches(
      matches.map((m) => (m.id === draggedMatch.id ? updatedMatch : m))
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: DIALOG_WIDTH,
          height: DIALOG_HEIGHT,
          borderRadius: 3,
          boxShadow: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: 28,
          fontWeight: 600,
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: (theme) => theme.palette.background.paper,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        Edit Tournament
      </DialogTitle>
      <DialogContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          p: 4,
          overflowY: "auto",
          background: (theme) => theme.palette.background.paper,
        }}
      >
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fill in all required fields
          </Alert>
        )}
        <Stack spacing={3} sx={{ width: "100%" }}>
          <TextField
            label="Tournament Name"
            value={tournament.name}
            onChange={(e) => onTournamentChange("name", e.target.value)}
            fullWidth
            disabled={isUpdating}
            error={!!errors.name}
            helperText={errors.name}
            required
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <TextField
              label="Location"
              value={tournament.location}
              onChange={(e) => onTournamentChange("location", e.target.value)}
              fullWidth
              disabled={isUpdating}
              error={!!errors.location}
              helperText={errors.location}
              required
            />
            <TextField
              label="Date"
              type="date"
              value={tournament.date}
              onChange={(e) => onTournamentChange("date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={isUpdating}
              error={!!errors.date}
              helperText={errors.date}
              required
            />
            <TextField
              label="Time"
              type="time"
              value={tournament.time}
              onChange={(e) => onTournamentChange("time", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={isUpdating}
              error={!!errors.time}
              helperText={errors.time}
              required
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              gap: 3,
              minHeight: GAMES_AREA_HEIGHT,
            }}
          >
            <Paper
              sx={{
                flex: 7,
                minWidth: 0,
                height: GAMES_AREA_HEIGHT,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                border: "2px dashed",
                borderColor: "divider",
                background: "transparent",
                color: "text.secondary",
                mr: 2,
                overflowY: "auto",
                position: "relative",
              }}
              elevation={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Box sx={{ display: "flex", gap: 2, p: 2 }}>
                {[1, 2, 3, 4].map((round) => (
                  <Button
                    key={round}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addEmptyMatch(round)}
                    sx={{ mb: 2 }}
                  >
                    Add Round {round} Match
                  </Button>
                ))}
              </Box>
              {matches.map((match) => (
                <Paper
                  key={match.id}
                  draggable
                  onDragStart={() => handleDragStart(match)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    position: "absolute",
                    left: match.position?.x || 0,
                    top: match.position?.y || 0,
                    width: BASE_BOX_WIDTH,
                    height: BASE_BOX_HEIGHT,
                    p: 2,
                    cursor: "move",
                    backgroundColor:
                      match.team1 === null && match.team2 === null
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.05)",
                    border:
                      match.team1 === null && match.team2 === null
                        ? "1px dashed rgba(255, 255, 255, 0.2)"
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2">
                      Round {match.round} - Match {match.matchNumber}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeMatch(match.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {match.team1?.username || "TBD"} vs{" "}
                      {match.team2?.username || "TBD"}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Paper>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: "divider",
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isUpdating}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isUpdating}
          sx={{ minWidth: 100 }}
        >
          {isUpdating ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTournamentDialog;
