import React from "react";
import { Box, Paper, Avatar, useTheme, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Match, DraggableParticipant } from "../../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
  parentWidth: number;
  parentHeight: number;
  isSourceMatch: boolean;
  onSelectAsSource: () => void;
}

const MATCH_BOX_WIDTH = 140;
const MATCH_BOX_HEIGHT = 60;
const PADDING = 16 * 2;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
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

  const renderParticipantBox = (
    participant: DraggableParticipant | null,
    color: string,
    isTeam1: boolean
  ) => {
    const textColor = theme.palette.getContrastText(color);
    return (
      <Box
        onDrop={(e) => {
          e.preventDefault();
          if (draggedParticipant) {
            onUpdate({ [isTeam1 ? "team1" : "team2"]: draggedParticipant });
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: participant ? "flex-start" : "center",
          backgroundColor: color,
          color: textColor,
          borderRadius: 2,
          p: 0.5,
          width: "100%",
          mb: 0.5,
          fontWeight: 600,
          fontSize: 13,
          opacity: participant ? 1 : 0.7,
          border: participant ? undefined : `2px dashed ${textColor}`,
          cursor: "pointer",
          minHeight: 28,
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.04)",
          },
        }}
      >
        {participant ? (
          <>
            <Avatar
              src={participant.profilePicture}
              alt={participant.username}
              sx={{
                width: 22,
                height: 22,
                mr: 1,
                border: `2px solid ${textColor}`,
              }}
            />
            <Box>{participant.username}</Box>
          </>
        ) : (
          <Box sx={{ fontStyle: "italic", fontSize: 14 }}>TBD</Box>
        )}
      </Box>
    );
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
        width: MATCH_BOX_WIDTH,
        height: MATCH_BOX_HEIGHT * 2.2,
        p: 1.5,
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.paper",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.03)",
          borderColor: "primary.main",
        },
        border: isSourceMatch
          ? `2px solid ${theme.palette.primary.main}`
          : undefined,
      }}
      draggable
      onDragStart={(e) => {
        const team = match.team1 || match.team2;
        if (team) onDragStart(e);
      }}
      onDragEnd={onDragEnd}
      onClick={onSelectAsSource}
    >
      <IconButton
        onClick={onDelete}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 10,
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      {renderParticipantBox(match.team1, theme.palette.primary.main, true)}
      <Box
        sx={{
          fontWeight: 700,
          color: "text.secondary",
          fontSize: 14,
          my: 0.5,
        }}
      >
        VS
      </Box>
      {renderParticipantBox(match.team2, theme.palette.secondary.main, false)}
    </Paper>
  );
};
