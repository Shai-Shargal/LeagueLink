import React from "react";
import {
  Box,
  Paper,
  Avatar,
  useTheme,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { Match, DraggableParticipant, Team } from "../../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (participant: DraggableParticipant) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
  parentWidth: number;
  parentHeight: number;
  isSourceMatch?: boolean;
  onSelectAsSource?: () => void;
}

const MATCH_BOX_WIDTH = 140;
const MATCH_BOX_HEIGHT = 60;
const PADDING = 16 * 2;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  channelUsers,
  draggedParticipant,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdate,
  parentWidth,
  parentHeight,
  isSourceMatch,
  onSelectAsSource,
}) => {
  const theme = useTheme();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedParticipant) return;

    const team = e.currentTarget.getAttribute("data-team");
    if (!team) return;

    const updatedMatch = { ...match };
    if (team === "team1") {
      updatedMatch.team1 = {
        type: "player",
        id: draggedParticipant.userId,
        isGuest: draggedParticipant.isGuest || false,
        score: 0,
      };
    } else if (team === "team2") {
      updatedMatch.team2 = {
        type: "player",
        id: draggedParticipant.userId,
        isGuest: draggedParticipant.isGuest || false,
        score: 0,
      };
    }

    onUpdate(updatedMatch);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  let left = match.position.x - MATCH_BOX_WIDTH / 2;
  let top = match.position.y - MATCH_BOX_HEIGHT / 2;
  if (left < PADDING / 2) left = PADDING / 2;
  if (top < PADDING / 2) top = PADDING / 2;
  if (left + MATCH_BOX_WIDTH > parentWidth - PADDING / 2)
    left = parentWidth - PADDING / 2 - MATCH_BOX_WIDTH;
  if (top + MATCH_BOX_HEIGHT > parentHeight - PADDING / 2)
    top = parentHeight - PADDING / 2 - MATCH_BOX_HEIGHT;

  return (
    <Paper
      sx={{
        position: "absolute",
        left,
        top,
        ...(match.teamType === "team"
          ? {
              minWidth: 340,
              maxWidth: 480,
              minHeight: 200,
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              backgroundColor: "transparent",
              transition: "transform 0.2s ease-in-out, border-color 0.3s ease",
              "&:hover": {
                transform: "scale(1.03)",
                borderColor: "primary.main",
              },
              border: isSourceMatch
                ? `2px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
              zIndex: 10,
              cursor: "pointer",
            }
          : {
              width: 140,
              height: 132,
              p: 1.5,
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "background.paper",
              transition: "transform 0.2s ease-in-out, border-color 0.3s ease",
              "&:hover": {
                transform: "scale(1.03)",
                borderColor: "primary.main",
              },
              border: isSourceMatch
                ? `2px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
              zIndex: 10,
              cursor: "pointer",
            }),
      }}
      draggable
      onClick={onSelectAsSource}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2">Match {match.matchNumber}</Typography>
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onSelectAsSource?.();
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box
          data-team="team1"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            p: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            minHeight: 40,
            backgroundColor: match.team1 ? "action.hover" : "transparent",
          }}
        >
          {match.team1 ? (
            <Typography variant="body2">
              {match.team1.type === "team"
                ? `Team ${match.team1.players?.length || 0} players`
                : channelUsers.find((u) => u.userId === match.team1?.id)
                    ?.username || "Unknown"}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Drop player here
            </Typography>
          )}
        </Box>

        <Box
          data-team="team2"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            p: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            minHeight: 40,
            backgroundColor: match.team2 ? "action.hover" : "transparent",
          }}
        >
          {match.team2 ? (
            <Typography variant="body2">
              {match.team2.type === "team"
                ? `Team ${match.team2.players?.length || 0} players`
                : channelUsers.find((u) => u.userId === match.team2?.id)
                    ?.username || "Unknown"}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Drop player here
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
