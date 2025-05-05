import React from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { Match } from "../../../types";

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
        p: 2,
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6">Matches ({matches.length})</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Add Match">
          <IconButton onClick={onAddMatch} size="small">
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={onUndo}
              size="small"
              disabled={historyIndex === 0}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton
              onClick={onRedo}
              size="small"
              disabled={historyIndex === matchHistory.length - 1}
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Auto Arrange">
          <IconButton onClick={onAutoArrange} size="small">
            <AutoFixHighIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear All">
          <IconButton
            onClick={onClearAll}
            size="small"
            disabled={matches.length === 0}
          >
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
