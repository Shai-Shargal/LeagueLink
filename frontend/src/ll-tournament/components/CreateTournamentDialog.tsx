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
  Avatar,
  Alert,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { Tournament, GuestUser } from "../types";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newTournament: Partial<Tournament>;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  isCreating: boolean;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 600;
const GAMES_AREA_HEIGHT = 400;

const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  newTournament,
  onTournamentChange,
  channelUsers,
  isCreating,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [newGuestUsername, setNewGuestUsername] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newTournament.name?.trim()) {
      newErrors.name = "Tournament name is required";
    }
    if (!newTournament.location?.trim()) {
      newErrors.location = "Location is required";
    }
    if (!newTournament.date) {
      newErrors.date = "Date is required";
    }
    if (!newTournament.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Add guest users to the tournament participants
      const guestParticipants = guestUsers.map((guest) => ({
        userId: `guest_${guest.username}`,
        username: guest.username,
        status: "PENDING",
        stats: {},
        isGuest: true,
      }));

      onTournamentChange("participants", [
        ...(newTournament.participants || []),
        ...guestParticipants,
      ]);
      onSubmit();
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setErrors({});
      setGuestUsers([]);
      setNewGuestUsername("");
      onClose();
    }
  };

  const handleAddGuest = () => {
    if (newGuestUsername.trim()) {
      setGuestUsers([
        ...guestUsers,
        {
          username: newGuestUsername.trim(),
        },
      ]);
      setNewGuestUsername("");
      setGuestDialogOpen(false);
    }
  };

  const removeGuestUser = (index: number) => {
    setGuestUsers(guestUsers.filter((_, i) => i !== index));
  };

  return (
    <>
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
          Create New Tournament
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
              value={newTournament.name}
              onChange={(e) => onTournamentChange("name", e.target.value)}
              fullWidth
              disabled={isCreating}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <TextField
                label="Location"
                value={newTournament.location}
                onChange={(e) => onTournamentChange("location", e.target.value)}
                fullWidth
                disabled={isCreating}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
              <TextField
                label="Date"
                type="date"
                value={newTournament.date}
                onChange={(e) => onTournamentChange("date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isCreating}
                error={!!errors.date}
                helperText={errors.date}
                required
              />
              <TextField
                label="Time"
                type="time"
                value={newTournament.time}
                onChange={(e) => onTournamentChange("time", e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isCreating}
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
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Games Area (Future Use)
                </Typography>
              </Paper>
              <Paper
                sx={{
                  flex: 3,
                  minWidth: 220,
                  height: GAMES_AREA_HEIGHT,
                  background: "background.paper",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  alignItems: "center",
                  border: "2px solid",
                  borderColor: "divider",
                  boxSizing: "border-box",
                  justifyContent: "flex-start",
                }}
                elevation={0}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Channel Participants
                </Typography>
                {channelUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      width: "100%",
                    }}
                  >
                    <Avatar
                      src={user.profilePicture}
                      sx={{ mr: 1, width: 40, height: 40 }}
                    />
                    <Typography sx={{ flex: 1 }}>{user.username}</Typography>
                  </Box>
                ))}

                <Divider sx={{ width: "100%", my: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Guest Participants
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setGuestDialogOpen(true)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Add Guest Participant
                </Button>

                {guestUsers.map((guest, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      width: "100%",
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 1,
                        width: 40,
                        height: 40,
                        backgroundColor: "rgba(0, 0, 0, 0.08)",
                        color: "text.secondary",
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Typography sx={{ flex: 1 }}>{guest.username}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeGuestUser(index)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
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
          <Button onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating}
            sx={{
              minWidth: 200,
              height: 48,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(45deg, #C680E3, #9333EA)",
              "&:hover": {
                background: "linear-gradient(45deg, #9333EA, #7928CA)",
              },
            }}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            Create Tournament
          </Button>
        </DialogActions>
      </Dialog>

      {/* Guest User Dialog */}
      <Dialog
        open={guestDialogOpen}
        onClose={() => {
          setGuestDialogOpen(false);
          setNewGuestUsername("");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Guest Participant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Guest Username"
            type="text"
            fullWidth
            value={newGuestUsername}
            onChange={(e) => setNewGuestUsername(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddGuest();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setGuestDialogOpen(false);
              setNewGuestUsername("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddGuest}
            variant="contained"
            disabled={!newGuestUsername.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateTournamentDialog;
