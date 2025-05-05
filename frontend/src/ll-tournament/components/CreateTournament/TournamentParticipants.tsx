import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DraggableParticipant, GuestUser } from "../../types";

interface TournamentParticipantsProps {
  channelUsers: DraggableParticipant[];
  guestUsers: GuestUser[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (participant: DraggableParticipant) => void;
  onDragEnd: () => void;
  onAddGuest: () => void;
  onRemoveGuest: (index: number) => void;
}

export const TournamentParticipants: React.FC<TournamentParticipantsProps> = ({
  channelUsers,
  guestUsers,
  draggedParticipant,
  onDragStart,
  onDragEnd,
  onAddGuest,
  onRemoveGuest,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: "rgba(16, 20, 30, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Channel Participants
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {channelUsers.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                cursor: "move",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
              draggable
              onDragStart={() => onDragStart(user)}
              onDragEnd={onDragEnd}
            >
              <Avatar
                src={user.profilePicture}
                alt={user.username}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="body2">{user.username}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1">Guest Participants</Typography>
          <Tooltip title="Add Guest">
            <IconButton
              size="small"
              onClick={onAddGuest}
              sx={{ color: "text.secondary" }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {guestUsers.map((user, index) => (
            <Box
              key={user.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Avatar
                src={user.profilePicture}
                alt={user.username}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="body2">{user.username}</Typography>
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Remove Guest">
                <IconButton
                  size="small"
                  onClick={() => onRemoveGuest(index)}
                  sx={{ color: "text.secondary" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
