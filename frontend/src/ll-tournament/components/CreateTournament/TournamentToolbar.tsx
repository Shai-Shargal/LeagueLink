import React from "react";
import {
  Paper,
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

interface TournamentToolbarProps {
  matchesCount: number;
  historyIndex: number;
  onAddMatch: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoArrange: () => void;
  onClearAll: () => void;
}

export const TournamentToolbar: React.FC<TournamentToolbarProps> = ({
  matchesCount,
  historyIndex,
  onAddMatch,
  onUndo,
  onRedo,
  onAutoArrange,
  onClearAll,
}) => {
  return (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        backgroundColor: "rgba(16, 20, 30, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Add Match">
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddMatch}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                backgroundColor: "rgba(240, 6, 201, 0.08)",
              },
            }}
          >
            Add Match
          </Button>
        </Tooltip>
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
      />

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
              disabled={historyIndex >= matchesCount - 1}
              sx={{ color: "text.secondary" }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Auto-arrange Matches">
          <span>
            <IconButton
              size="small"
              onClick={onAutoArrange}
              disabled={matchesCount === 0}
              sx={{ color: "text.secondary" }}
            >
              <AutoFixHighIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Clear All Matches">
          <span>
            <IconButton
              size="small"
              onClick={onClearAll}
              disabled={matchesCount === 0}
              sx={{ color: "text.secondary" }}
            >
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {matchesCount} matches
        </Typography>
      </Box>
    </Paper>
  );
};
