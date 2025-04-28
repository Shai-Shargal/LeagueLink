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
} from "@mui/material";
import { Tournament } from "../types";

interface EditTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tournament: Tournament;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  isUpdating: boolean;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 600;
const GAMES_AREA_HEIGHT = 400;

const EditTournamentDialog: React.FC<EditTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  tournament,
  onTournamentChange,
  isUpdating,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      onSubmit();
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setErrors({});
      onClose();
    }
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
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed",
                borderColor: "divider",
                background: "transparent",
                color: "text.secondary",
                mr: 2,
                overflowY: "auto",
              }}
              elevation={0}
            >
              <Typography variant="body1">
                Tournament details and configuration
              </Typography>
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
