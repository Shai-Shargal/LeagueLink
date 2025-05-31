import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

const ViewTournamentInChannel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const channelId =
    searchParams.get("channel") || location.pathname.split("/").pop();

  const handleBackToChannel = () => {
    navigate(`/channel/${channelId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
      }}
    >
      <Typography variant="h6" sx={{ color: "#fff", p: 2 }}>
        Tournament Stats for Channel
      </Typography>
    </Box>
  );
};

export default ViewTournamentInChannel;
