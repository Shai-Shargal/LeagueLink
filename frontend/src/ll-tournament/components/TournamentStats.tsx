import React from "react";
import styled from "styled-components";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Channel } from "../../ll-channels/types/ChannelView";

const TournamentStatsContainer = styled.div`
  flex: 1;
  height: 100%;
  background: linear-gradient(135deg, #23243a 0%, #2f184b 100%);
  color: #f3eaff;
  padding: 32px 32px 0 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #e1cfff;
  letter-spacing: 0.5px;
`;

const BackButtonContainer = styled(Box)`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0 0;
  position: absolute;
  bottom: 10px;
  right: 13px;
`;

interface TournamentStatsProps {
  channelId: string;
  channelName: string;
  onBackClick: () => void;
}

const TournamentStats: React.FC<TournamentStatsProps> = ({
  channelId,
  channelName,
  onBackClick,
}) => {
  return (
    <TournamentStatsContainer>
      <Title>Tournament Stats for Channel: {channelName}</Title>
      {/* Add your tournament stats content here */}

      <BackButtonContainer>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBackClick}
          sx={{
            width: "240px",
            color: "#f3eaff",
            boxShadow: "0 2px 8px 0 rgba(198,128,227,0.10)",
            borderRadius: "8px",
            background:
              "linear-gradient(90deg, rgba(198,128,227,0.18) 0%, rgba(198,128,227,0.28) 100%)",
            "&:hover": {
              background:
                "linear-gradient(90deg, rgba(198,128,227,0.32) 0%, rgba(198,128,227,0.45) 100%)",
            },
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          Back to Chat
        </Button>
      </BackButtonContainer>
    </TournamentStatsContainer>
  );
};

export default TournamentStats;
