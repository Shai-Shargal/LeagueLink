import React from "react";
import { Box, Paper } from "@mui/material";
import { Match, DraggableParticipant } from "../../types";
import { MatchBox } from "./MatchBox";

interface TournamentBracketProps {
  matches: Match[];
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  isCreatingMatch: boolean;
  newMatchPosition: { x: number; y: number } | null;
  onMatchDragStart: (matchId: string, e: React.DragEvent) => void;
  onMatchDragEnd: () => void;
  onMatchDrop: (matchId: string, e: React.DragEvent) => void;
  onMatchDragOver: (e: React.DragEvent) => void;
  onMatchDelete: (matchId: string) => void;
  onMatchUpdate: (matchId: string, updates: Partial<Match>) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  channelUsers,
  isCreatingMatch,
  newMatchPosition,
  onMatchDragStart,
  onMatchDragEnd,
  onMatchDrop,
  onMatchDragOver,
  onMatchDelete,
  onMatchUpdate,
}) => {
  const handleDrop = (e: React.DragEvent) => {
    onMatchDrop("", e);
  };

  const handleMatchDragStart = (matchId: string, e: React.DragEvent) => {
    onMatchDragStart(matchId, e);
  };

  const handleMatchDrop = (matchId: string, e: React.DragEvent) => {
    onMatchDrop(matchId, e);
  };

  const handleMatchUpdate = (matchId: string, updates: Partial<Match>) => {
    onMatchUpdate(matchId, updates);
  };

  return (
    <Paper
      sx={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        border: "2px dashed",
        borderColor: "divider",
        background: "transparent",
        color: "text.secondary",
        overflowY: "auto",
        position: "relative",
      }}
      elevation={0}
      onDrop={handleDrop}
      onDragOver={onMatchDragOver}
    >
      {isCreatingMatch && newMatchPosition && (
        <Paper
          sx={{
            position: "absolute",
            left: newMatchPosition.x - 100,
            top: newMatchPosition.y - 50,
            width: 200,
            height: 100,
            p: 2,
            cursor: "crosshair",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "2px dashed",
            borderColor: "primary.main",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ mt: 1 }}>TBD vs TBD</Box>
          </Box>
        </Paper>
      )}

      {matches.map((match) => (
        <MatchBox
          key={match.id}
          match={match}
          channelUsers={channelUsers}
          onDragStart={(e: React.DragEvent) =>
            handleMatchDragStart(match.id, e)
          }
          onDragEnd={onMatchDragEnd}
          onDrop={(e: React.DragEvent) => handleMatchDrop(match.id, e)}
          onDelete={() => onMatchDelete(match.id)}
          onUpdate={(updates: Partial<Match>) =>
            handleMatchUpdate(match.id, updates)
          }
        />
      ))}
    </Paper>
  );
};
