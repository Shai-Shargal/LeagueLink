import React from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TournamentStatsContainer = styled.div`
  flex: 1;
  height: calc(100vh - 60px); // Subtract header height
  background-color: #2f3136;
  color: #dcddde;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const BackButtonContainer = styled(Box)`
  margin-top: auto;
  width: 240px;
  margin-left: auto;
  padding: 16px 0 0 0;
  border-top: 1px solid rgba(198, 128, 227, 0.2);
  background-color: #2f3136;
`;

const TournamentStats: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();

  return (
    <TournamentStatsContainer>
      <h1>Tournament Stats for Channel: {channelId}</h1>
      <BackButtonContainer>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/dashboard?channel=${channelId}`)}
          sx={{
            width: "100%",
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
      </BackButtonContainer>
    </TournamentStatsContainer>
  );
};

export default TournamentStats;
