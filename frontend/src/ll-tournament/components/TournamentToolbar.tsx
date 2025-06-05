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
        gap: 1.5,
        p: 1,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 1,
      }}
    >
      <Button
        size="small"
        variant="contained"
        startIcon={<AddIcon fontSize="small" />}
        onClick={onCreateMatch}
        sx={{
          backgroundColor: "#2196F3",
          minWidth: "unset",
          px: 2,
          "&:hover": {
            backgroundColor: "#1976D2",
          },
        }}
      >
        Create
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
              size="small"
              sx={{
                color: canUndo
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo">
          <span>
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}
              size="small"
              sx={{
                color: canRedo
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TournamentToolbar;
