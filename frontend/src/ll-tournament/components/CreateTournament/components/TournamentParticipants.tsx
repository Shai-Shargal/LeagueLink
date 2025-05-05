import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import {
  DraggableParticipant,
  GuestUser,
  ParticipantStatus,
} from "../../../types";

interface TournamentParticipantsProps {
  channelUsers: DraggableParticipant[];
  guestUsers: GuestUser[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (participant: DraggableParticipant) => void;
  onDragEnd: () => void;
  onAddGuest: () => void;
  onRemoveGuest: (guestId: string) => void;
}

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
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Channel Participants
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {channelUsers.map((participant) => (
            <Box
              key={participant.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "background.default",
                cursor: "grab",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              draggable
              onDragStart={() => onDragStart(participant)}
              onDragEnd={onDragEnd}
            >
              <Avatar
                src={participant.profilePicture}
                alt={participant.username}
                sx={{ width: 32, height: 32 }}
              >
                <PersonIcon />
              </Avatar>
              <Typography>{participant.username}</Typography>
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
              key={index}
              draggable
              onDragStart={() =>
                onDragStart({
                  id: `guest_${guest.username}`,
                  userId: `guest_${guest.username}`,
                  username: guest.username,
                  status: ParticipantStatus.PENDING,
                })
              }
              onDragEnd={onDragEnd}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "background.default",
                cursor: "grab",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Typography>{guest.username}</Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => onRemoveGuest(`guest_${guest.username}`)}
                sx={{ color: "text.secondary" }}
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
