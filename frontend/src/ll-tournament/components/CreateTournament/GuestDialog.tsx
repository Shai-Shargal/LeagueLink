import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { GuestUser } from "../../types";

interface GuestDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (guest: GuestUser) => void;
}

export const GuestDialog: React.FC<GuestDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onAdd({
        id: `guest_${username}`,
        username: username.trim(),
      });
      setUsername("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Guest Participant</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!username.trim()}>
            Add Guest
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
