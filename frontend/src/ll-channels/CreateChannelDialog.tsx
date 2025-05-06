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

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (channelData: {
    name: string;
    description: string;
    passcode: string;
    image: string;
  }) => Promise<void>;
  loading: boolean;
}

const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    passcode: "",
    image: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    passcode: "",
  });

  const validateForm = () => {
    const errors = {
      name: "",
      description: "",
      passcode: "",
    };
    let isValid = true;

    if (!newChannel.name || newChannel.name.length < 3) {
      errors.name = "Channel name must be at least 3 characters long";
      isValid = false;
    }

    if (!newChannel.description || newChannel.description.length < 10) {
      errors.description = "Description must be at least 10 characters long";
      isValid = false;
    }

    if (!newChannel.passcode || newChannel.passcode.length < 6) {
      errors.passcode = "Passcode must be at least 6 characters long";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await onSubmit(newChannel);
    setNewChannel({
      name: "",
      description: "",
      passcode: "",
      image: "",
    });
    setFormErrors({
      name: "",
      description: "",
      passcode: "",
    });
  };

  const handleClose = () => {
    setNewChannel({
      name: "",
      description: "",
      passcode: "",
      image: "",
    });
    setFormErrors({
      name: "",
      description: "",
      passcode: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Channel</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            label="Channel Name"
            value={newChannel.name}
            onChange={(e) =>
              setNewChannel({ ...newChannel, name: e.target.value })
            }
            error={!!formErrors.name}
            helperText={formErrors.name || "Must be at least 3 characters"}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={newChannel.description}
            onChange={(e) =>
              setNewChannel({ ...newChannel, description: e.target.value })
            }
            error={!!formErrors.description}
            helperText={
              formErrors.description || "Must be at least 10 characters"
            }
            multiline
            rows={3}
            fullWidth
            required
          />
          <TextField
            label="Passcode"
            value={newChannel.passcode}
            onChange={(e) =>
              setNewChannel({ ...newChannel, passcode: e.target.value })
            }
            error={!!formErrors.passcode}
            helperText={formErrors.passcode || "Must be at least 6 characters"}
            fullWidth
            required
            type="password"
          />
          <TextField
            label="Image URL (optional)"
            value={newChannel.image}
            onChange={(e) =>
              setNewChannel({ ...newChannel, image: e.target.value })
            }
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            background: "linear-gradient(45deg, #C680E3, #9333EA)",
            "&:hover": {
              background: "linear-gradient(45deg, #9333EA, #7928CA)",
            },
          }}
        >
          {loading ? "Creating..." : "Create Channel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChannelDialog;
