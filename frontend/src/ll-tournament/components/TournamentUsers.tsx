import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { authService } from "../../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isGuest?: boolean;
}

interface TournamentUsersProps {
  channelId: string;
  onUserSelect: (user: User) => void;
}

const TournamentUsers: React.FC<TournamentUsersProps> = ({
  channelId,
  onUserSelect,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestUsers, setGuestUsers] = useState<User[]>([]);
  const [guestCounter, setGuestCounter] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.getChannel(channelId);
        setUsers(
          response.data.members.map((member: any) => ({
            id: member._id,
            name: member.username,
            email: member.email || "",
            avatar: member.profilePicture || null,
            isGuest: false,
          }))
        );
      } catch (err) {
        setError("Failed to fetch channel members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchUsers();
    }
  }, [channelId]);

  const handleAddGuest = () => {
    const newGuest: User = {
      id: `guest-${guestCounter}`,
      name: `Guest User ${guestCounter}`,
      email: `guest${guestCounter}@example.com`,
      avatar: null,
      isGuest: true,
    };
    setGuestUsers([...guestUsers, newGuest]);
    setGuestCounter(guestCounter + 1);
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuestUsers(guestUsers.filter((guest) => guest.id !== guestId));
  };

  const allUsers = [...users, ...guestUsers];

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading users: {error}</Typography>;
  }

  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        p: 2,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Tournament Users
        </Typography>
        <Tooltip title="Add Guest User">
          <IconButton
            onClick={handleAddGuest}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <List sx={{ p: 0 }}>
        {allUsers.map((user) => (
          <ListItem
            key={user.id}
            button
            onClick={() => onUserSelect(user)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              "&:hover": {
                background: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={user.avatar || undefined}
                sx={{
                  bgcolor: user.isGuest ? "primary.main" : "secondary.main",
                }}
              >
                {user.avatar ? null : <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={user.isGuest ? "Guest User" : user.email}
              primaryTypographyProps={{
                sx: { fontWeight: 500 },
              }}
              secondaryTypographyProps={{
                sx: { color: "rgba(255,255,255,0.5)" },
              }}
            />
            {user.isGuest && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveGuest(user.id);
                }}
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    color: "error.main",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TournamentUsers;
