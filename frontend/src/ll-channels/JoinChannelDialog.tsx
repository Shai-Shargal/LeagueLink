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

interface JoinChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (channelData: {
    channelName: string;
    passcode: string;
  }) => Promise<void>;
  loading: boolean;
}

const JoinChannelDialog: React.FC<JoinChannelDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [joinChannel, setJoinChannel] = useState({
    channelName: "",
    passcode: "",
  });

  const handleSubmit = async () => {
    await onSubmit(joinChannel);
    setJoinChannel({
      channelName: "",
      passcode: "",
    });
  };

  const handleClose = () => {
    setJoinChannel({
      channelName: "",
      passcode: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Join Channel</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            label="Channel Name"
            value={joinChannel.channelName}
            onChange={(e) =>
              setJoinChannel({
                ...joinChannel,
                channelName: e.target.value,
              })
            }
            fullWidth
            required
          />
          <TextField
            label="Passcode"
            value={joinChannel.passcode}
            onChange={(e) =>
              setJoinChannel({ ...joinChannel, passcode: e.target.value })
            }
            fullWidth
            required
            type="password"
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
          {loading ? "Joining..." : "Join Channel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinChannelDialog;
