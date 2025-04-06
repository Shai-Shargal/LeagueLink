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
  Snackbar,
  Menu,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { authService } from "../services/api";
import ChannelView from "./ChannelView";
import { useSearchParams } from "react-router-dom";

const DRAWER_WIDTH = 240;

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
  owner: {
    _id: string;
    username: string;
    profilePicture: string;
  };
}

interface ChannelsResponse {
  data: Channel[];
}

// Custom Crown Icon component
const CrownIcon = (props: any) => (
  <SvgIcon {...props} viewBox="0 0 511.993 511.993">
    <g>
      <polygon
        style={{ fill: "#C680E3" }}
        points="70.521,313.224 70.521,391.149 256,411.879 441.479,391.149 441.479,313.224 256,292.495"
      />
      <circle style={{ fill: "#b61616" }} cx="139.621" cy="352.19" r="13.594" />
      <polygon
        style={{ opacity: 0.1 }}
        points="131.47,391.149 131.47,313.224 286.474,295.901 256,292.495 70.521,313.224 70.521,391.149 256,411.879 286.474,408.473"
      />
      <g>
        <circle
          style={{ fill: "#b61616" }}
          cx="255.996"
          cy="352.19"
          r="13.594"
        />
        <circle
          style={{ fill: "#b61616" }}
          cx="372.384"
          cy="352.19"
          r="13.594"
        />
      </g>
      <path
        style={{ fill: "#C680E3" }}
        d="M441.479,292.495l50.693-150.076l-10.654-11.414c0,0-131.556,159.811-215.767-15.981h-19.504 c-84.209,175.792-215.767,15.981-215.767,15.981l-10.654,11.414l50.693,150.076H441.479z"
      />
      <g style={{ opacity: 0.1 }}>
        <path d="M30.483,131.004l-10.654,11.416l50.693,150.076h60.949l-36.928-109.32C57.337,163.622,30.483,131.004,30.483,131.004z" />
      </g>
      <g>
        <circle
          style={{ fill: "#9244a2" }}
          cx="255.996"
          cy="106.225"
          r="26.842"
        />
        <circle
          style={{ fill: "#9244a2" }}
          cx="26.842"
          cy="137.382"
          r="26.842"
        />
        <circle
          style={{ fill: "#9244a2" }}
          cx="485.151"
          cy="137.382"
          r="26.842"
        />
      </g>
      <ellipse
        style={{ fill: "#b61616" }}
        cx="255.996"
        cy="208.717"
        rx="22.568"
        ry="33.217"
      />
      <path
        style={{ fill: "#9244a2" }}
        d="M441.479,271.766H70.521c-11.449,0-20.73,9.281-20.73,20.73l0,0c0,11.449,9.281,20.73,20.73,20.73 h370.958c11.449,0,20.73-9.281,20.73-20.73l0,0C462.209,281.046,452.927,271.766,441.479,271.766z"
      />
      <path
        style={{ opacity: 0.1 }}
        d="M110.74,292.495L110.74,292.495c0-11.449,9.281-20.73,20.73-20.73H70.521 c-11.449,0-20.73,9.281-20.73,20.73l0,0c0,11.449,9.281,20.73,20.73,20.73h60.949C120.021,313.224,110.74,303.944,110.74,292.495z"
      />
      <path
        style={{ fill: "#9244a2" }}
        d="M441.479,391.149H70.521c-11.449,0-20.73,9.281-20.73,20.73l0,0c0,11.449,9.281,20.73,20.73,20.73 h370.958c11.449,0,20.73-9.281,20.73-20.73l0,0C462.209,400.431,452.927,391.149,441.479,391.149z"
      />
      <path
        style={{ opacity: 0.1 }}
        d="M110.74,411.879L110.74,411.879c0-11.449,9.281-20.73,20.73-20.73H70.521 c-11.449,0-20.73,9.281-20.73,20.73l0,0c0,11.449,9.281,20.73,20.73,20.73h60.949C120.021,432.609,110.74,423.328,110.74,411.879z"
      />
    </g>
  </SvgIcon>
);

// Custom Football Icon component
const FootballIcon = (props: any) => (
  <SvgIcon {...props} viewBox="0 0 48 48">
    <g
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="48" height="48" fill="white" fillOpacity="0.01" />
      <g
        transform="translate(4.000000, 4.000000)"
        stroke="#C680E3"
        strokeWidth="4"
      >
        <circle cx="20" cy="20" r="20" />
        <g transform="translate(2.000000, 2.000000)">
          <g transform="translate(0.000000, 0.500000)">
            <polyline points="24.0930233 -8.8817842e-16 18.0697674 4.35897436 18.0697674 8.71794872 25.8139535 14.8205128 30.1162791 13.0769231 32.6976744 6.1025641" />
            <polyline points="12.0465116 -8.8817842e-16 18.0697674 4.35897436 18.0697674 8.71794872 10.3255814 14.8205128 6.02325581 13.0769231 3.44186047 6.1025641" />
            <polyline points="1.0658141e-14 15.6923077 6.02325581 13.0769231 10.3255814 14.8205128 12.9069767 24.4102564 10.3255814 27.8974359 2.58139535 27.8974359" />
            <polyline points="10.3255814 34 10.3255814 27.8974359 12.9069767 24.4102564 23.2325581 24.4102564 25.8139535 27.8974359 25.8139535 34" />
            <polyline points="33.5581395 27.8974359 25.8139535 27.8974359 23.2325581 24.4102564 25.8139535 14.8205128 30.1162791 13.0769231 37 16.5641026" />
          </g>
        </g>
      </g>
    </g>
  </SvgIcon>
);

const Channels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    passcode: "",
    image: "",
  });
  const [joinChannel, setJoinChannel] = useState({
    channelName: "",
    passcode: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    passcode: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedChannelForSettings, setSelectedChannelForSettings] =
    useState<Channel | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editChannelData, setEditChannelData] = useState({
    description: "",
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        console.log("Current user response:", response);
        if (response && response._id) {
          console.log("Setting current user ID:", response._id);
          setCurrentUserId(response._id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [currentUserId]);

  const fetchChannels = async () => {
    try {
      console.log("Fetching channels...");
      const response = (await authService.getMyChannels()) as ChannelsResponse;
      console.log("Channels response:", response);
      if (response.data) {
        console.log(
          "Channel owners:",
          response.data.map((c) => ({
            name: c.name,
            owner: c.owner?._id,
            currentUser: currentUserId,
            isOwner: c.owner?._id === currentUserId,
          }))
        );
        setChannels(response.data);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setError("Failed to load channels");
    }
  };

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

  const handleCreateChannel = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.createChannel(newChannel);
      setOpenCreate(false);
      setNewChannel({
        name: "",
        description: "",
        passcode: "",
        image: "",
      });
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

  const handleChannelClick = (channel: Channel) => {
    console.log("Selected channel:", channel);
    if (!channel.members || !channel.admins) {
      console.error("Channel data is incomplete:", channel);
      setError("Channel data is incomplete. Please try refreshing the page.");
      return;
    }
    setSelectedChannel(channel);
    setSearchParams({ channel: channel._id });
  };

  const handleCloseAlert = () => {
    setError("");
    setSuccess("");
  };

  const handleSettingsClick = (
    event: React.MouseEvent<HTMLElement>,
    channel: Channel
  ) => {
    event.stopPropagation();
    setSettingsAnchorEl(event.currentTarget);
    setSelectedChannelForSettings(channel);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
    setSelectedChannelForSettings(null);
  };

  const handleEditClick = () => {
    if (selectedChannelForSettings) {
      setEditChannelData({
        description: selectedChannelForSettings.description,
      });
      setOpenEditDialog(true);
    }
    handleSettingsClose();
  };

  const handleEditChannel = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedChannelForSettings) return;

      await authService.updateChannel(
        selectedChannelForSettings._id,
        editChannelData
      );
      setSuccess("Channel updated successfully!");
      setOpenEditDialog(false);
      fetchChannels();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update channel");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedChannelForSettings) return;

      await authService.deleteChannel(selectedChannelForSettings._id);
      setSuccess("Channel deleted successfully!");
      handleSettingsClose();
      fetchChannels();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete channel");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChannel = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedChannelForSettings) return;

      await authService.leaveChannel(selectedChannelForSettings._id);
      setSuccess("Successfully left the channel!");
      handleSettingsClose();
      fetchChannels();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to leave channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Channels List */}
      <List sx={{ flex: 1, overflowY: "auto", pt: 0 }}>
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
            onClick={() => handleChannelClick(channel)}
            sx={{
              px: 2,
              py: 0.5,
              color: selectedChannel?._id === channel._id ? "#fff" : "#8e9297",
              cursor: "pointer",
              backgroundColor:
                selectedChannel?._id === channel._id
                  ? "rgba(79, 84, 92, 0.6)"
                  : "transparent",
              "&:hover": {
                backgroundColor:
                  selectedChannel?._id === channel._id
                    ? "rgba(79, 84, 92, 0.6)"
                    : "rgba(79, 84, 92, 0.4)",
                color: "#dcddde",
                "& .channel-settings": {
                  opacity: 1,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
              {(() => {
                return (
                  <Tooltip
                    title={
                      channel.owner?._id === currentUserId
                        ? "You own this channel"
                        : "Channel member"
                    }
                  >
                    {channel.owner?._id === currentUserId ? (
                      <CrownIcon
                        sx={{
                          fontSize: "20px",
                          transform: "scale(1.2)",
                          opacity: 1,
                        }}
                      />
                    ) : (
                      <FootballIcon
                        sx={{
                          fontSize: "20px",
                          transform: "scale(1.2)",
                          opacity: 0.7,
                        }}
                      />
                    )}
                  </Tooltip>
                );
              })()}
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
              onClick={(e) => handleSettingsClick(e, channel)}
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

      {/* Create/Join Channel Buttons */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(198, 128, 227, 0.2)" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
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
            Create
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenJoin(true)}
            sx={{
              background: "linear-gradient(45deg, #C680E3, #9333EA)",
              "&:hover": {
                background: "linear-gradient(45deg, #9333EA, #7928CA)",
              },
            }}
          >
            Join
          </Button>
        </Box>
      </Box>

      {/* Create Channel Dialog */}
      <Dialog
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setFormErrors({
            name: "",
            description: "",
            passcode: "",
          });
          setNewChannel({
            name: "",
            description: "",
            passcode: "",
            image: "",
          });
        }}
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
              helperText={
                formErrors.passcode || "Must be at least 6 characters"
              }
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
          <Button
            onClick={() => {
              setOpenCreate(false);
              setFormErrors({
                name: "",
                description: "",
                passcode: "",
              });
              setNewChannel({
                name: "",
                description: "",
                passcode: "",
                image: "",
              });
            }}
          >
            Cancel
          </Button>
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

      {/* Replace Alert components with Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        message={error}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#f44336",
            color: "#fff",
          },
        }}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        message={success}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#4caf50",
            color: "#fff",
          },
        }}
      />
    </Box>
  );
};

export default Channels;
