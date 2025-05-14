import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Match, DraggableParticipant } from "../../types";

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

const CARD_WIDTH = 160;
const CARD_HEIGHT = 110;
const BORDER_RADIUS = 16;

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

  let left = match.position.x - CARD_WIDTH / 2;
  let top = match.position.y - CARD_HEIGHT / 2;
  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + CARD_WIDTH > parentWidth) left = parentWidth - CARD_WIDTH;
  if (top + CARD_HEIGHT > parentHeight) top = parentHeight - CARD_HEIGHT;

  // Helper to get participant info
  const getParticipant = (team: any) => {
    if (!team) return null;
    if (team.type === "team" && team.players && team.players.length > 0) {
      // Show first player as representative
      const user = channelUsers.find((u) => u.userId === team.players[0].id);
      return user || null;
    }
    if (team.type === "player") {
      return channelUsers.find((u) => u.userId === team.id) || null;
    }
    return null;
  };

  const topParticipant = getParticipant(match.team1);
  const bottomParticipant = getParticipant(match.team2);

  return (
    <Paper
      sx={{
        position: "absolute",
        left,
        top,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 0,
        boxShadow: 4,
        background: "#23293a",
        border: isSourceMatch
          ? `2px solid ${theme.palette.primary.main}`
          : `2px solid #353b4b`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        p: 0,
      }}
      draggable
      onClick={onSelectAsSource}
    >
      {/* Top participant pill */}
      <Box
        data-team="team1"
        onDrop={(e) => {
          e.preventDefault();
          if (!draggedParticipant) return;
          onUpdate({
            team1: {
              type: "player",
              id: draggedParticipant.userId,
              isGuest: draggedParticipant.isGuest || false,
              score: 0,
            },
          });
        }}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          width: "80%",
          minHeight: 26,
          background: topParticipant ? "#4f46e5" : "#23293a",
          color: topParticipant ? "#fff" : "#bdbdbd",
          borderRadius: 99,
          border: "2px dashed",
          borderColor: topParticipant ? "#a5b4fc" : "#bdbdbd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.2,
          py: 0.2,
          fontWeight: 700,
          mt: 1.2,
          mb: 0.5,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            color: topParticipant ? "#fff" : "#a5b4fc",
            fontStyle: "italic",
            fontSize: 13,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {topParticipant ? topParticipant.username : "TBD"}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{ color: topParticipant ? "#fff" : "#a5b4fc", p: 0.2 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      {/* VS */}
      <Box sx={{ width: "100%", textAlign: "center", py: 0.1, minHeight: 14 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ color: "#bdbdbd", letterSpacing: 2, fontSize: 12 }}
        >
          VS
        </Typography>
      </Box>
      {/* Bottom participant pill */}
      <Box
        data-team="team2"
        onDrop={(e) => {
          e.preventDefault();
          if (!draggedParticipant) return;
          onUpdate({
            team2: {
              type: "player",
              id: draggedParticipant.userId,
              isGuest: draggedParticipant.isGuest || false,
              score: 0,
            },
          });
        }}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          width: "80%",
          minHeight: 26,
          background: bottomParticipant ? "#a21caf" : "#23293a",
          color: bottomParticipant ? "#fff" : "#bdbdbd",
          borderRadius: 99,
          border: "2px dashed",
          borderColor: bottomParticipant ? "#f0abfc" : "#bdbdbd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 1.2,
          py: 0.2,
          fontWeight: 700,
          mt: 0.5,
          mb: 1.2,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            color: bottomParticipant ? "#fff" : "#f0abfc",
            fontStyle: "italic",
            fontSize: 13,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {bottomParticipant ? bottomParticipant.username : "TBD"}
        </Typography>
      </Box>
      {/* Best of */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 0.2,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "#fff", fontSize: 12 }}>
          Best of
        </Typography>
        <select
          value={match.rounds || 3}
          onChange={(e) => {
            const val = Number(e.target.value);
            onUpdate({ rounds: val });
          }}
          style={{
            width: 36,
            marginLeft: 4,
            borderRadius: 6,
            border: "1px solid #bdbdbd",
            background: "#23293a",
            color: "#fff",
            textAlign: "center",
            fontSize: 12,
            outline: "none",
            padding: "2px 0",
          }}
        >
          {[1, 3, 5, 7, 9].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </Box>
    </Paper>
  );
};

export default MatchBox;
