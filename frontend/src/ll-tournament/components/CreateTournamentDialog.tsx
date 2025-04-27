import React from "react";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import { Tournament } from "../types";

interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newTournament: Partial<Tournament>;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  isCreating: boolean;
}

const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  newTournament,
  onTournamentChange,
  channelUsers,
  isCreating,
}) => {
  return (
    <Dialog open={open} onClose={() => !isCreating && onClose()}>
      <DialogTitle>Create New Tournament</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2, minWidth: 300 }}>
          <TextField
            label="Tournament Name"
            value={newTournament.name}
            onChange={(e) => onTournamentChange("name", e.target.value)}
            fullWidth
            disabled={isCreating}
          />
          <TextField
            label="Date"
            type="date"
            value={newTournament.date}
            onChange={(e) => onTournamentChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            disabled={isCreating}
          />
          <TextField
            label="Time"
            type="time"
            value={newTournament.time}
            onChange={(e) => onTournamentChange("time", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            disabled={isCreating}
          />
          <TextField
            label="Location"
            value={newTournament.location}
            onChange={(e) => onTournamentChange("location", e.target.value)}
            fullWidth
            disabled={isCreating}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Participants ({channelUsers.length} users will be automatically
              added)
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: "auto" }}>
              {channelUsers.map((user) => (
                <Chip
                  key={user.id}
                  label={user.username}
                  sx={{ m: 0.5 }}
                  color="primary"
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={isCreating}
          startIcon={isCreating ? <CircularProgress size={20} /> : null}
        >
          {isCreating ? "Creating..." : "Create Tournament"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTournamentDialog;
