import React from "react";
import {
  Box,
  Paper,
  Avatar,
  Tooltip,
  IconButton,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Match, DraggableParticipant } from "../../../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
}

const MATCH_BOX_WIDTH = 200;
const MATCH_BOX_HEIGHT = 100;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  channelUsers,
  draggedParticipant,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdate,
}) => {
  const theme = useTheme();

  // Debug: log match on each render
  React.useEffect(() => {
    console.log("MatchBox render:", match);
  }, [match]);

  const handleDrop = (e: React.DragEvent, isTeam1: boolean) => {
    e.preventDefault();
    if (draggedParticipant) {
      onUpdate({ [isTeam1 ? "team1" : "team2"]: draggedParticipant });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderParticipantBox = (
    participant: DraggableParticipant | null,
    color: string,
    isTeam1: boolean
  ) => {
    return (
      <Box
        onDrop={(e) => {
          e.preventDefault();
          console.log("Drop event:", { isTeam1, draggedParticipant });
          if (draggedParticipant) {
            onUpdate({ [isTeam1 ? "team1" : "team2"]: draggedParticipant });
            console.log(
              "onUpdate called for",
              isTeam1 ? "team1" : "team2",
              draggedParticipant
            );
          } else {
            console.log("No draggedParticipant");
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: participant ? "flex-start" : "center",
          backgroundColor: color,
          color: "#fff",
          borderRadius: 2,
          p: 1,
          minHeight: 36,
          minWidth: 0,
          width: "100%",
          mb: 1,
          fontWeight: 600,
          fontSize: 16,
          opacity: participant ? 1 : 0.7,
          border: participant ? undefined : "2px dashed #fff",
          cursor: "pointer",
        }}
      >
        {participant ? (
          <>
            <Avatar
              src={participant.profilePicture}
              alt={participant.username}
              sx={{ width: 28, height: 28, mr: 1, border: "2px solid #fff" }}
            />
            <Box sx={{ fontWeight: 600, fontSize: 16 }}>
              {participant.username}
            </Box>
          </>
        ) : (
          "TBD"
        )}
      </Box>
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {renderParticipantBox(match.team1, theme.palette.primary.main, true)}
      <Box sx={{ textAlign: "center", fontWeight: 700, color: "#fff", mb: 1 }}>
        VS
      </Box>
      {renderParticipantBox(match.team2, theme.palette.secondary.main, false)}
    </Paper>
  );
};
