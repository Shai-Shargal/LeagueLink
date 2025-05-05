import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import { DraggableParticipant } from "../types";
import { GuestUser, ParticipantStatus } from "../../ll-tournament/types";

interface TournamentParticipantsProps {
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  guestUsers: GuestUser[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (participant: DraggableParticipant) => void;
  onDragEnd: () => void;
  onAddGuest: () => void;
  onRemoveGuest: (index: number) => void;
}

const GAMES_AREA_HEIGHT = 600;

export const TournamentParticipants: React.FC<TournamentParticipantsProps> = ({
  channelUsers,
  guestUsers,
  onDragStart,
  onDragEnd,
  onAddGuest,
  onRemoveGuest,
}) => {
  return (
    <Paper
      sx={{
        width: 300,
        height: GAMES_AREA_HEIGHT,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: (theme) => theme.palette.background.paper,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Channel Participants
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {channelUsers.map((user) => (
            <Box
              key={user.id}
              draggable
              onDragStart={() =>
                onDragStart({
                  id: user.id,
                  userId: user.id,
                  username: user.username,
                  status: ParticipantStatus.PENDING,
                  stats: {},
                  type: "channel",
                } as DraggableParticipant)
              }
              onDragEnd={onDragEnd}
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                cursor: "move",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
            >
              <Avatar src={user.profilePicture} sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body2">{user.username}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider />

      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6">Guest Participants</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={onAddGuest}
            size="small"
            variant="outlined"
          >
            Add Guest
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {guestUsers.map((guest, index) => (
            <Box
              key={guest.username}
              draggable
              onDragStart={() =>
                onDragStart({
                  id: `guest_${guest.username}`,
                  userId: `guest_${guest.username}`,
                  username: guest.username,
                  status: ParticipantStatus.PENDING,
                  stats: {},
                  type: "guest",
                } as DraggableParticipant)
              }
              onDragEnd={onDragEnd}
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                cursor: "move",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body2">{guest.username}</Typography>
              <IconButton
                size="small"
                onClick={() => onRemoveGuest(index)}
                sx={{ ml: "auto" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
