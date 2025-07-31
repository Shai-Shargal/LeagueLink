import React from "react";
import { Box, Button } from "@mui/material";

interface ChannelStatsBoxProps {
  onViewStats?: () => void;
  currentView?: "tournaments" | "stats";
}

const ChannelStatsBox: React.FC<ChannelStatsBoxProps> = ({
  onViewStats,
  currentView = "tournaments",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        p: 2,
        mt: 1,
        mb: 2,
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        sx={{
          minWidth: 180,
          fontWeight: 600,
          backgroundColor: "#9C27B0",
          "&:hover": {
            backgroundColor: "#7B1FA2",
          },
        }}
        onClick={onViewStats}
      >
        {currentView === "tournaments"
          ? "Channel Stats"
          : "Back to Tournaments"}
      </Button>
    </Box>
  );
};

export default ChannelStatsBox;
