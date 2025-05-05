import React from "react";
import { Typography, Box, IconButton, Tooltip, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { Match } from "../types";

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
      }}
    >
      <Tooltip title="Add Match">
        <IconButton
          onClick={onAddMatch}
          size="small"
          sx={{
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.light",
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Undo">
        <IconButton
          onClick={onUndo}
          disabled={historyIndex <= 0}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <UndoIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Redo">
        <IconButton
          onClick={onRedo}
          disabled={historyIndex >= matchHistory.length - 1}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <RedoIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Auto Arrange">
        <IconButton
          onClick={onAutoArrange}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <AutoFixHighIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Clear All">
        <IconButton
          onClick={onClearAll}
          size="small"
          sx={{
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
            },
          }}
        >
          <DeleteSweepIcon />
        </IconButton>
      </Tooltip>

      <Typography
        variant="body2"
        sx={{
          ml: 2,
          color: "text.secondary",
        }}
      >
        {matches.length} Matches
      </Typography>
    </Box>
  );
};
