import React from "react";
import { Box, Paper, Avatar, Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Match, DraggableParticipant } from "../../../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
}

const MATCH_BOX_WIDTH = 200;
const MATCH_BOX_HEIGHT = 100;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  channelUsers,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", match.id);
    onDragStart(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderParticipant = (participant: DraggableParticipant | null) => {
    if (!participant) return null;
    const user = channelUsers.find((u) => u.id === participant.id);
    return (
      <Tooltip key={participant.id} title={user?.username || "Unknown"}>
        <Avatar
          src={user?.profilePicture}
          alt={user?.username || "Unknown"}
          sx={{ width: 24, height: 24 }}
        />
      </Tooltip>
    );
  };

  return (
    <Paper
      sx={{
        position: "absolute",
        left: match.position.x - MATCH_BOX_WIDTH / 2,
        top: match.position.y - MATCH_BOX_HEIGHT / 2,
        width: MATCH_BOX_WIDTH,
        height: MATCH_BOX_HEIGHT,
        p: 2,
        cursor: "move",
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {renderParticipant(match.team1)}
        </Box>
        <Box sx={{ mx: 1 }}>vs</Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {renderParticipant(match.team2)}
        </Box>
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{ position: "absolute", top: -20, right: -20 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};
