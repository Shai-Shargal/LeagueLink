import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface EditChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
  initialDescription: string;
  loading: boolean;
}

const EditChannelDialog: React.FC<EditChannelDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialDescription,
  loading,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!description || description.length < 10) {
      setError("Description must be at least 10 characters long");
      return;
    }

    await onSubmit(description);
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(198, 128, 227, 0.2)",
        },
      }}
    >
      <DialogTitle sx={{ color: "#fff" }}>Edit Channel Description</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": {
                borderColor: "rgba(198, 128, 227, 0.4)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(198, 128, 227, 0.6)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#C680E3",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(198, 128, 227, 0.7)",
              "&.Mui-focused": {
                color: "#C680E3",
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: "#C680E3",
            "&:hover": {
              backgroundColor: "rgba(198, 128, 227, 0.1)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#C680E3",
            "&:hover": {
              backgroundColor: "#9333EA",
            },
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditChannelDialog;
