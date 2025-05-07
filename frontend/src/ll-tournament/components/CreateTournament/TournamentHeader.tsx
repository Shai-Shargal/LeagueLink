import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { Match } from "../../types";

interface TournamentHeaderProps {
  matches: Match[];
  historyIndex: number;
  matchHistory: Match[][];
  onAddMatch: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoArrange: () => void;
  onClearAll: () => void;
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  matches,
  historyIndex,
  matchHistory,
  onAddMatch,
  onUndo,
  onRedo,
  onAutoArrange,
  onClearAll,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        backgroundColor: "rgba(196, 216, 14, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        border: "1px solid rgb(240, 10, 221)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Add Match">
          <IconButton
            size="small"
            onClick={onAddMatch}
            sx={{ color: "text.secondary" }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Undo">
          <span>
            <IconButton
              size="small"
              onClick={onUndo}
              disabled={historyIndex <= 0}
              sx={{ color: "text.secondary" }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton
              size="small"
              onClick={onRedo}
              disabled={historyIndex >= matchHistory.length - 1}
              sx={{ color: "text.secondary" }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Auto-arrange Matches">
          <IconButton
            size="small"
            onClick={onAutoArrange}
            disabled={matches.length === 0}
            sx={{ color: "text.secondary" }}
          >
            <AutoFixHighIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear All Matches">
          <IconButton
            size="small"
            onClick={onClearAll}
            disabled={matches.length === 0}
            sx={{ color: "text.secondary" }}
          >
            <DeleteSweepIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {matches.length} matches
        </Typography>
      </Box>
    </Box>
  );
};
