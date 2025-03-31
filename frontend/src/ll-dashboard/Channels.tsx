import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Tag as TagIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { authService } from "../services/api";

interface Channel {
  _id: string;
  name: string;
  description: string;
  image: string;
  members: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
  admins: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
}

const Channels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    passcode: "",
    image: "",
  });
  const [joinChannel, setJoinChannel] = useState({
    channelId: "",
    passcode: "",
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await authService.getMyChannels();
      setChannels(response.data);
    } catch (error) {
      console.error("Error fetching channels:", error);
      setError("Failed to load channels");
    }
  };

  const handleCreateChannel = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.createChannel(newChannel);
      setOpenCreate(false);
      setSuccess("Channel created successfully!");
      fetchChannels();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.joinChannel(joinChannel);
      setOpenJoin(false);
      setSuccess("Successfully joined the channel!");
      fetchChannels();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to join channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Server/App Name */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(198, 128, 227, 0.2)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          LeagueLink
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Join Channel">
              <IconButton
                size="small"
                onClick={() => setOpenJoin(true)}
                sx={{ color: "#dcddde" }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Typography>
      </Box>

      {/* Channels List */}
      <List sx={{ flex: 1, p: 0 }}>
        <ListItem
          sx={{
            px: 2,
            py: 1,
            color: "#dcddde",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          CHANNELS
        </ListItem>
        {channels.map((channel) => (
          <ListItem
            key={channel._id}
            component="div"
            sx={{
              px: 2,
              py: 0.5,
              color: "#8e9297",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(79, 84, 92, 0.4)",
                color: "#dcddde",
                "& .channel-settings": {
                  opacity: 1,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
              <TagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={channel.name}
              sx={{
                "& .MuiListItemText-primary": {
                  fontSize: "14px",
                },
              }}
            />
            <IconButton
              size="small"
              className="channel-settings"
              sx={{
                color: "inherit",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Create Channel Button */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(198, 128, 227, 0.2)" }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{
            background: "linear-gradient(45deg, #C680E3, #9333EA)",
            "&:hover": {
              background: "linear-gradient(45deg, #9333EA, #7928CA)",
            },
          }}
        >
          Create Channel
        </Button>
      </Box>

      {/* Create Channel Dialog */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Channel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Channel Name"
              value={newChannel.name}
              onChange={(e) =>
                setNewChannel({ ...newChannel, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newChannel.description}
              onChange={(e) =>
                setNewChannel({ ...newChannel, description: e.target.value })
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
              fullWidth
              required
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
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            onClick={handleCreateChannel}
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

      {/* Join Channel Dialog */}
      <Dialog
        open={openJoin}
        onClose={() => setOpenJoin(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Join Channel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Channel ID"
              value={joinChannel.channelId}
              onChange={(e) =>
                setJoinChannel({ ...joinChannel, channelId: e.target.value })
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
          <Button
            onClick={handleJoinChannel}
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

      {error && (
        <Alert
          severity="error"
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2000 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2000 }}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default Channels;
