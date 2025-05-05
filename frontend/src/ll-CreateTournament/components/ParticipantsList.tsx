import React from "react";
import {
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import {
  DraggableParticipant,
  ParticipantStatus,
} from "../../ll-tournament/types";

interface ParticipantsListProps {
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  guestUsers: { username: string }[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (participant: DraggableParticipant) => void;
  onDragEnd: () => void;
  onAddGuest: () => void;
  onRemoveGuest: (index: number) => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
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
        flex: 3,
        minWidth: 280,
        height: 600,
        background: "#242b3d",
        borderRadius: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        alignItems: "stretch",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      elevation={0}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          color: "white",
          fontSize: "1.1rem",
        }}
      >
        Channel Participants
      </Typography>
      {channelUsers.map((user) => (
        <Box
          key={user.id}
          draggable
          onDragStart={() =>
            onDragStart({
              id: user.id,
              userId: user.id,
              username: user.username,
              profilePicture: user.profilePicture,
              status: ParticipantStatus.PENDING,
            })
          }
          onDragEnd={onDragEnd}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            p: 1,
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            backgroundColor:
              draggedParticipant?.id === user.id
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          <Avatar
            src={user.profilePicture}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Typography
            sx={{
              flex: 1,
              color: "white",
            }}
          >
            {user.username}
          </Typography>
        </Box>
      ))}

      <Divider
        sx={{
          my: 3,
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      />

      <Typography
        variant="h6"
        sx={{
          mb: 3,
          color: "white",
          fontSize: "1.1rem",
        }}
      >
        Guest Participants
      </Typography>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddGuest}
        sx={{
          mb: 2,
          borderColor: "rgba(255, 255, 255, 0.3)",
          color: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        Add Guest Participant
      </Button>

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
            mb: 2,
            p: 1,
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            backgroundColor:
              draggedParticipant?.id === `guest_${guest.username}`
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <PersonIcon />
          </Avatar>
          <Typography
            sx={{
              flex: 1,
              color: "white",
            }}
          >
            {guest.username}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onRemoveGuest(index)}
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              "&:hover": {
                color: "rgba(255, 255, 255, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Paper>
  );
};
