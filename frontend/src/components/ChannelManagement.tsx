import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExitToApp as LeaveIcon,
} from "@mui/icons-material";
import channelService from "../services/channelService";

interface ChannelMember {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface Channel {
  _id: string;
  name: string;
  description: string;
  owner: ChannelMember;
  admins: ChannelMember[];
  members: ChannelMember[];
  image?: string;
  isPrivate: boolean;
}

const ChannelManagement: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<ChannelMember | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"transfer" | "delete" | "leave">(
    "transfer"
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    loadChannelData();
  }, [channelId]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      const [channelData, statsData] = await Promise.all([
        channelService.getChannelDetails(channelId!),
        channelService.getChannelStats(channelId!),
      ]);
      setChannel(channelData.data);
      setStats(statsData.data);
    } catch (err) {
      setError("Failed to load channel data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    member: ChannelMember
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleAction = async (action: string) => {
    if (!selectedMember || !channel) return;

    try {
      switch (action) {
        case "promote":
          await channelService.promoteMember(channel._id, selectedMember._id);
          break;
        case "demote":
          await channelService.demoteAdmin(channel._id, selectedMember._id);
          break;
        case "kick":
          await channelService.kickMember(channel._id, selectedMember._id);
          break;
        case "transfer":
          setDialogType("transfer");
          setOpenDialog(true);
          break;
      }
      handleMenuClose();
      loadChannelData();
      setSnackbar({
        open: true,
        message: "Action completed successfully",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to perform action",
        severity: "error",
      });
      console.error(err);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogConfirm = async () => {
    if (!selectedMember || !channel) return;

    try {
      switch (dialogType) {
        case "transfer":
          await channelService.transferOwnership(
            channel._id,
            selectedMember._id
          );
          break;
        case "delete":
          await channelService.deleteChannel(channel._id);
          navigate("/channels");
          break;
        case "leave":
          await channelService.leaveChannel(channel._id);
          navigate("/channels");
          break;
      }
      handleDialogClose();
      setSnackbar({
        open: true,
        message: "Action completed successfully",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to perform action",
        severity: "error",
      });
      console.error(err);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error || !channel) {
    return (
      <Typography color="error">{error || "Channel not found"}</Typography>
    );
  }

  const isOwner = channel.owner._id === localStorage.getItem("userId");
  const isAdmin = channel.admins.some(
    (admin) => admin._id === localStorage.getItem("userId")
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {channel.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {channel.description}
          </Typography>
          {stats && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Members: {stats.totalMembers} | Admins: {stats.totalAdmins}
              </Typography>
              <Typography variant="body2">
                Created: {new Date(stats.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Members
          </Typography>
          <List>
            {/* Owner */}
            <ListItem>
              <PersonIcon sx={{ mr: 1 }} />
              <ListItemText
                primary={channel.owner.username}
                secondary="Owner"
              />
            </ListItem>

            {/* Admins */}
            {channel.admins.map((admin) => (
              <ListItem key={admin._id}>
                <AdminIcon sx={{ mr: 1 }} />
                <ListItemText primary={admin.username} secondary="Admin" />
                {isOwner && admin._id !== channel.owner._id && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleMenuClick(e, admin)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}

            {/* Regular Members */}
            {channel.members
              .filter(
                (member) =>
                  member._id !== channel.owner._id &&
                  !channel.admins.some((admin) => admin._id === member._id)
              )
              .map((member) => (
                <ListItem key={member._id}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <ListItemText primary={member.username} secondary="Member" />
                  {(isOwner || isAdmin) && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuClick(e, member)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
          </List>
        </CardContent>
      </Card>

      {/* Member Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isOwner && selectedMember && (
          <>
            {channel.admins.some(
              (admin) => admin._id === selectedMember._id
            ) ? (
              <MenuItem onClick={() => handleAction("demote")}>
                Demote to Member
              </MenuItem>
            ) : (
              <MenuItem onClick={() => handleAction("promote")}>
                Promote to Admin
              </MenuItem>
            )}
            <MenuItem onClick={() => handleAction("transfer")}>
              Transfer Ownership
            </MenuItem>
          </>
        )}
        {(isOwner || isAdmin) && selectedMember && (
          <MenuItem onClick={() => handleAction("kick")}>Kick Member</MenuItem>
        )}
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === "transfer"
            ? "Transfer Ownership"
            : dialogType === "delete"
              ? "Delete Channel"
              : "Leave Channel"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogType === "transfer"
              ? "Are you sure you want to transfer ownership?"
              : dialogType === "delete"
                ? "Are you sure you want to delete this channel?"
                : "Are you sure you want to leave this channel?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleDialogConfirm}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        {isOwner && (
          <>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/channels/${channelId}/edit`)}
            >
              Edit Channel
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setDialogType("delete");
                setOpenDialog(true);
              }}
            >
              Delete Channel
            </Button>
          </>
        )}
        {!isOwner && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LeaveIcon />}
            onClick={() => {
              setDialogType("leave");
              setOpenDialog(true);
            }}
          >
            Leave Channel
          </Button>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChannelManagement;
