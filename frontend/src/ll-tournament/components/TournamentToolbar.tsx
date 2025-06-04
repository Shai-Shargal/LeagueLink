import React from "react";
import { Box, Button, IconButton, Tooltip, Divider } from "@mui/material";
import {
  Add as AddIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from "@mui/icons-material";

interface TournamentToolbarProps {
  onCreateMatch: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TournamentToolbar: React.FC<TournamentToolbarProps> = ({
  onCreateMatch,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateMatch}
        sx={{
          backgroundColor: "#2196F3",
          "&:hover": {
            backgroundColor: "#1976D2",
          },
        }}
      >
        Create Match
      </Button>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(255,255,255,0.1)" }}
      />

      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={onUndo}
              disabled={!canUndo}
              sx={{
                color: canUndo
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo">
          <span>
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}
              sx={{
                color: canRedo
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TournamentToolbar;
