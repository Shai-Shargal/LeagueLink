import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import { Match, DraggableParticipant } from "../types";
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

const GAMES_AREA_HEIGHT = 600;
const MATCH_BOX_WIDTH = 200;
const MATCH_BOX_HEIGHT = 100;

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  channelUsers,
  draggedParticipant,
  isCreatingMatch,
  newMatchPosition,
  onMatchDragStart,
  onMatchDragEnd,
  onMatchDrop,
  onMatchDragOver,
  onMatchDelete,
  onMatchUpdate,
}) => {
  return (
    <Paper
      sx={{
        height: GAMES_AREA_HEIGHT,
        position: "relative",
        backgroundColor: "rgba(16, 20, 30, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
      }}
    >
      {isCreatingMatch && newMatchPosition && (
        <Box
          sx={{
            position: "absolute",
            left: newMatchPosition.x,
            top: newMatchPosition.y,
            width: MATCH_BOX_WIDTH,
            height: MATCH_BOX_HEIGHT,
            backgroundColor: "rgba(147, 51, 234, 0.1)",
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography variant="body2" color="primary">
            Drop to create match
          </Typography>
        </Box>
      )}

      {matches.map((match) => (
        <MatchBox
          key={match.id}
          match={match}
          channelUsers={channelUsers}
          draggedParticipant={draggedParticipant}
          onDragStart={(e) => onMatchDragStart(match.id, e)}
          onDragEnd={onMatchDragEnd}
          onDrop={(e) => onMatchDrop(match.id, e)}
          onDragOver={onMatchDragOver}
          onDelete={() => onMatchDelete(match.id)}
          onUpdate={(updates) => onMatchUpdate(match.id, updates)}
        />
      ))}
    </Paper>
  );
};
