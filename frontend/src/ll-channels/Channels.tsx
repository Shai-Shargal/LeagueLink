import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { authService } from "../services/api";
import { useSearchParams } from "react-router-dom";
import ChannelList from "./ChannelList";
import CreateChannelDialog from "./CreateChannelDialog";
import JoinChannelDialog from "./JoinChannelDialog";
import EditChannelDialog from "./EditChannelDialog";

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

const Channels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedChannelForSettings, setSelectedChannelForSettings] =
    useState<Channel | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
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
    console.log("Current user ID:", currentUserId);
    if (currentUserId) {
      fetchChannels();
    }
  }, [currentUserId]);

  const fetchChannels = async () => {
    try {
      console.log("Fetching channels...");
      const response = (await authService.getMyChannels()) as ChannelsResponse;
      console.log("Channels response:", response);
      if (response.data) {
        console.log("Setting channels:", response.data);
        setChannels(response.data);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setError("Failed to load channels");
    }
  };

  const handleCreateChannel = async (channelData: {
    name: string;
    description: string;
    passcode: string;
    image: string;
  }) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.createChannel(channelData);
      setOpenCreate(false);
      setSuccess("Channel created successfully!");
      fetchChannels();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async (channelData: {
    channelName: string;
    passcode: string;
  }) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.joinChannel(channelData);
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
    console.log("Selected channel:", {
      _id: channel._id,
      name: channel.name,
      description: channel.description,
      image: channel.image,
      members: channel.members,
      admins: channel.admins,
      owner: channel.owner,
    });
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
  };

  const handleEditClick = () => {
    if (selectedChannelForSettings) {
      console.log(
        "Opening edit dialog with description:",
        selectedChannelForSettings.description
      );
      setOpenEditDialog(true);
      setSettingsAnchorEl(null);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedChannelForSettings(null);
    setError("");
  };

  const handleEditChannel = async (description: string) => {
    try {
      if (!selectedChannelForSettings) {
        console.error("No channel selected for editing");
        return;
      }

      setLoading(true);
      setError("");

      console.log("Updating channel:", {
        channelId: selectedChannelForSettings._id,
        newDescription: description,
      });

      const response = await authService.updateChannel(
        selectedChannelForSettings._id,
        { description }
      );

      console.log("Update response:", response);
      setSuccess("Channel updated successfully!");
      setOpenEditDialog(false);
      await fetchChannels();
    } catch (error: any) {
      console.error("Error updating channel:", error);
      if (error.response) {
        console.error("Error details:", error.response.data);
      }
      setError(error.response?.data?.message || "Failed to update channel");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this channel? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!selectedChannelForSettings) return;

      await authService.deleteChannel(selectedChannelForSettings._id);
      setSuccess("Channel deleted successfully!");
      handleSettingsClose();
      fetchChannels();
      if (searchParams.get("channel") === selectedChannelForSettings._id) {
        setSearchParams({});
      }
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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        currentUserId={currentUserId}
        onChannelClick={handleChannelClick}
        onSettingsClick={handleSettingsClick}
      />

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(198, 128, 227, 0.2)",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#0f172a",
        }}
      >
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

      <CreateChannelDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateChannel}
        loading={loading}
      />

      <JoinChannelDialog
        open={openJoin}
        onClose={() => setOpenJoin(false)}
        onSubmit={handleJoinChannel}
        loading={loading}
      />

      <EditChannelDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSubmit={handleEditChannel}
        initialDescription={selectedChannelForSettings?.description || ""}
        loading={loading}
      />

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

      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(198, 128, 227, 0.2)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            minWidth: "200px",
          },
          "& .MuiMenuItem-root": {
            color: "#fff",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "rgba(198, 128, 227, 0.1)",
            },
          },
        }}
      >
        {selectedChannelForSettings?.owner?._id === currentUserId ? (
          <Box>
            <MenuItem onClick={handleEditClick}>
              <ListItemIcon>
                <EditIcon sx={{ color: "#C680E3" }} />
              </ListItemIcon>
              <ListItemText primary="Edit Description" />
            </MenuItem>
            <MenuItem
              onClick={handleDeleteChannel}
              sx={{ color: "#ef4444 !important" }}
            >
              <ListItemIcon>
                <DeleteIcon sx={{ color: "#ef4444" }} />
              </ListItemIcon>
              <ListItemText primary="Delete Channel" />
            </MenuItem>
            <Divider sx={{ borderColor: "rgba(198, 128, 227, 0.2)" }} />
            <MenuItem onClick={handleLeaveChannel}>
              <ListItemText primary="Leave Channel" sx={{ color: "#ef4444" }} />
            </MenuItem>
          </Box>
        ) : (
          <MenuItem onClick={handleLeaveChannel}>
            <ListItemText primary="Leave Channel" sx={{ color: "#ef4444" }} />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Channels;
