import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { Match } from "../../types";

interface MatchConnectionManagerProps {
  match: Match;
  isSourceMatch: boolean;
  isConnectionMode: boolean;
  onSelectAsSource: () => void;
}

export const MatchConnectionManager: React.FC<MatchConnectionManagerProps> = ({
  match,
  isSourceMatch,
  isConnectionMode,
  onSelectAsSource,
}) => {
  if (!isConnectionMode) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 4,
        left: 4,
        zIndex: 10,
      }}
    >
      <Tooltip
        title={isSourceMatch ? "Selected as source" : "Select as source"}
      >
        <IconButton
          onClick={onSelectAsSource}
          sx={{
            color: isSourceMatch ? "primary.main" : "action.active",
            backgroundColor: isSourceMatch ? "primary.light" : "transparent",
            "&:hover": {
              backgroundColor: isSourceMatch ? "primary.light" : "action.hover",
            },
          }}
        >
          <LinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
