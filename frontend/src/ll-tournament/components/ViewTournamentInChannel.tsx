import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import TournamentList from "./TournamentList";
import CreateTournamentBox from "./CreateTournamentBox";

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
        position: "relative",
      }}
    >
      <CreateTournamentBox
        onCreate={() => {
          /* TODO: open create tournament dialog */
        }}
      />
      {channelId && <TournamentList channelId={channelId} />}
    </Box>
  );
};

export default ViewTournamentInChannel;
