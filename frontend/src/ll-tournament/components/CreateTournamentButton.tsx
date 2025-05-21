import React from "react";
import { Button } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { BackButtonContainer } from "../styles/BackButtonContainer";
import { TournamentStatsContainer } from "../styles/TournamentStatsContainer";
import { Title } from "../styles/Title";
import { AddIcon } from "../icons/AddIcon";
import { ArrowBackIcon } from "../icons/ArrowBackIcon";

const CreateTournamentButton: React.FC = () => {
  return (
    <TournamentStatsContainer>
      <Title>Tournament Stats for Channel: {channelName}</Title>
      {/* Add your tournament stats content here */}

      <BackButtonContainer
        sx={{
          width: "100%",
          justifyContent: "space-between",
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          px: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          onClick={() => {
            /* Placeholder for create tournament */
          }}
        >
          Create Tournament
        </Button>
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

export default CreateTournamentButton;
