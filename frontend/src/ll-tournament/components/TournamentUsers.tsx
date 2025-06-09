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
        background: "rgba(0,0,0,0.2)",
        borderRadius: 2,
        p: 2,
        height: "100%",
        border: "1px solid rgba(103,58,183,0.2)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          pb: 1,
          borderBottom: "1px solid rgba(103,58,183,0.2)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: "linear-gradient(45deg, #673AB7, #9C27B0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Tournament Users
        </Typography>
        <Tooltip title="Add Guest User">
          <IconButton
            onClick={handleAddGuest}
            sx={{
              color: "rgba(255,255,255,0.7)",
              backgroundColor: "rgba(103,58,183,0.1)",
              "&:hover": {
                color: "#fff",
                backgroundColor: "rgba(103,58,183,0.2)",
              },
              transition: "all 0.2s ease",
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
              backgroundColor: "rgba(103,58,183,0.03)",
              border: "1px solid rgba(103,58,183,0.1)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "rgba(103,58,183,0.08)",
                transform: "translateX(4px)",
                borderColor: "rgba(103,58,183,0.3)",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={user.avatar || undefined}
                sx={{
                  bgcolor: user.isGuest ? "#673AB7" : "#9C27B0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "2px solid rgba(103,58,183,0.2)",
                }}
              >
                {user.avatar ? null : <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={user.isGuest ? "Guest User" : user.email}
              primaryTypographyProps={{
                sx: {
                  fontWeight: 500,
                  color: "#fff",
                },
              }}
              secondaryTypographyProps={{
                sx: {
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                },
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
                  backgroundColor: "rgba(103,58,183,0.1)",
                  "&:hover": {
                    color: "#ff4444",
                    backgroundColor: "rgba(255,68,68,0.1)",
                  },
                  transition: "all 0.2s ease",
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
