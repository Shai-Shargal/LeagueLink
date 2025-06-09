import React from "react";
import { Box, Button, IconButton, Tooltip, Divider } from "@mui/material";
import {
  Add as AddIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface TournamentToolbarProps {
  onCreateMatch: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onRefresh: () => void;
}

const TournamentToolbar: React.FC<TournamentToolbarProps> = ({
  onCreateMatch,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onRefresh,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: 2,
        border: "1px solid rgba(103,58,183,0.2)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Button
        size="small"
        variant="contained"
        startIcon={<AddIcon fontSize="small" />}
        onClick={onCreateMatch}
        sx={{
          backgroundColor: "#673AB7",
          minWidth: "unset",
          px: 2,
          py: 1,
          borderRadius: 1.5,
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "0 2px 4px rgba(103,58,183,0.3)",
          "&:hover": {
            backgroundColor: "#9C27B0",
            boxShadow: "0 4px 8px rgba(103,58,183,0.4)",
          },
        }}
      >
        Create Match
      </Button>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(103,58,183,0.2)" }}
      />

      <Tooltip title="Refresh">
        <span>
          <IconButton
            onClick={onRefresh}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.7)",
              backgroundColor: "rgba(103,58,183,0.1)",
              "&:hover": {
                backgroundColor: "rgba(103,58,183,0.2)",
                color: "#fff",
              },
              transition: "all 0.2s ease",
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

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
              backgroundColor: "rgba(103,58,183,0.1)",
              "&:hover": {
                backgroundColor: "rgba(103,58,183,0.2)",
                color: "#fff",
              },
              transition: "all 0.2s ease",
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
              backgroundColor: "rgba(103,58,183,0.1)",
              "&:hover": {
                backgroundColor: "rgba(103,58,183,0.2)",
                color: "#fff",
              },
              transition: "all 0.2s ease",
            }}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default TournamentToolbar;
