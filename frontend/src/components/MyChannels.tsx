import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ExitToApp as LeaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import channelService from "../services/channelService";

interface Channel {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  admins: Array<{
    _id: string;
    username: string;
    profilePicture?: string;
  }>;
  members: Array<{
    _id: string;
    username: string;
    profilePicture?: string;
  }>;
}

const MyChannels: React.FC = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveSuccess, setLeaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await channelService.getMyChannels();
      setChannels(response.data);
    } catch (err) {
      setError("Failed to load channels");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    channel: Channel
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedChannel(channel);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChannel(null);
  };

  const handleLeaveChannel = async () => {
    if (!selectedChannel) return;

    try {
      setLeaveError(null);
      setLeaveSuccess(null);
      await channelService.leaveChannel(selectedChannel._id);
      setLeaveSuccess(`Successfully left ${selectedChannel.name}`);
      setChannels(
        channels.filter((channel) => channel._id !== selectedChannel._id)
      );
    } catch (err: any) {
      setLeaveError(err.response?.data?.message || "Failed to leave channel");
    } finally {
      handleMenuClose();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            My Channels
          </Typography>
          {channels.length === 0 ? (
            <Typography color="text.secondary" align="center">
              You haven't joined any channels yet
            </Typography>
          ) : (
            <List>
              {channels.map((channel) => {
                const isOwner =
                  channel.owner._id === localStorage.getItem("userId");
                const isAdmin = channel.admins.some(
                  (admin) => admin._id === localStorage.getItem("userId")
                );

                return (
                  <Card key={channel._id} sx={{ mb: 2 }}>
                    <ListItem>
                      {isOwner ? (
                        <AdminIcon sx={{ mr: 1 }} />
                      ) : isAdmin ? (
                        <AdminIcon sx={{ mr: 1 }} />
                      ) : (
                        <PersonIcon sx={{ mr: 1 }} />
                      )}
                      <ListItemText
                        primary={channel.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {channel.description}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              {isOwner ? "Owner" : isAdmin ? "Admin" : "Member"}{" "}
                              | Members: {channel.members.length}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/channels/${channel._id}`)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        {!isOwner && (
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuClick(e, channel)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Card>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {leaveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {leaveError}
        </Alert>
      )}

      {leaveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {leaveSuccess}
        </Alert>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLeaveChannel}>
          <LeaveIcon sx={{ mr: 1 }} />
          Leave Channel
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MyChannels;
