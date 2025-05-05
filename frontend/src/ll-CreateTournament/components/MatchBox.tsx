import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Match, DraggableParticipant } from "../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
}

const MATCH_BOX_WIDTH = 200;
const MATCH_BOX_HEIGHT = 100;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  draggedParticipant,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDelete,
  onUpdate,
}) => {
  const handleDrop = (e: React.DragEvent, isTeam1: boolean) => {
    e.preventDefault();
    if (draggedParticipant) {
      onUpdate({
        [isTeam1 ? "team1" : "team2"]: draggedParticipant,
      });
    }
  };

  const handleRemovePlayer = (isTeam1: boolean) => {
    onUpdate({
      [isTeam1 ? "team1" : "team2"]: null,
    });
  };

  return (
    <Paper
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragOver={onDragOver}
      sx={{
        position: "absolute",
        left: match.position.x,
        top: match.position.y,
        width: MATCH_BOX_WIDTH,
        height: MATCH_BOX_HEIGHT,
        backgroundColor: "rgba(16, 20, 30, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Match {match.id}
        </Typography>
        <Tooltip title="Delete Match">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.light",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
            borderRadius: 1,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          onDrop={(e) => handleDrop(e, true)}
          onDragOver={(e) => e.preventDefault()}
        >
          {match.team1 ? (
            <>
              <Avatar
                src={match.team1.profilePicture}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body2" noWrap>
                {match.team1.username}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleRemovePlayer(true)}
                sx={{
                  ml: "auto",
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "error.light",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, textAlign: "center" }}
            >
              Drop player here
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
            borderRadius: 1,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          onDrop={(e) => handleDrop(e, false)}
          onDragOver={(e) => e.preventDefault()}
        >
          {match.team2 ? (
            <>
              <Avatar
                src={match.team2.profilePicture}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body2" noWrap>
                {match.team2.username}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleRemovePlayer(false)}
                sx={{
                  ml: "auto",
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "error.light",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, textAlign: "center" }}
            >
              Drop player here
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
