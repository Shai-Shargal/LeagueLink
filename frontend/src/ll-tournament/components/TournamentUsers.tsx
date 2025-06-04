import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { authService } from "../../services/api";

interface TournamentUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface TournamentUsersProps {
  channelId: string;
  onUserSelect?: (user: TournamentUser) => void;
}

const TournamentUsers: React.FC<TournamentUsersProps> = ({
  channelId,
  onUserSelect,
}) => {
  const [users, setUsers] = useState<TournamentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.getChannel(channelId);
        setUsers(response.data.members);
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

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.05)",
          p: 2,
          borderRadius: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "rgba(255,255,255,0.7)" }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.05)",
          p: 2,
          borderRadius: 2,
          height: "100%",
        }}
      >
        <Alert
          severity="error"
          sx={{ backgroundColor: "transparent", color: "#f44336" }}
        >
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        p: 2,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "rgba(255,255,255,0.9)" }}>
        Tournament Participants
      </Typography>

      <List sx={{ width: "100%" }}>
        {users.map((user) => (
          <ListItem
            key={user._id}
            sx={{
              cursor: onUserSelect ? "pointer" : "default",
              "&:hover": onUserSelect
                ? {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: 1,
                  }
                : {},
            }}
            onClick={() => onUserSelect?.(user)}
          >
            <ListItemAvatar>
              <Avatar
                src={user.profilePicture}
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              >
                {user.profilePicture ? null : <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
              primaryTypographyProps={{
                sx: { color: "rgba(255,255,255,0.9)" },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TournamentUsers;
