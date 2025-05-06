import React, { useState, useEffect } from "react";
import {
  Box,
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

// Custom Crown Icon component
const CrownIcon = React.forwardRef<SVGSVGElement, any>((props, ref) => (
  <SvgIcon {...props} ref={ref} viewBox="0 0 511.993 511.993">
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
));

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
