import React from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  EmojiEvents as TournamentIcon,
  BarChart as StatsIcon,
} from "@mui/icons-material";

interface TournamentViewProps {
  onBack: () => void;
}

const TournamentView: React.FC<TournamentViewProps> = ({ onBack }) => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
      }}
    >
      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#fff",
            mb: 3,
            fontWeight: 600,
          }}
        >
          Tournament Stats
        </Typography>

        {/* Back Button */}
        <Button
          variant="contained"
          startIcon={<TournamentIcon />}
          endIcon={<StatsIcon />}
          onClick={onBack}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            backgroundColor: "rgba(198, 128, 227, 0.2)",
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(198, 128, 227, 0.3)",
            },
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Back to Channel
        </Button>
      </Box>
    </Box>
  );
};

export default TournamentView;
