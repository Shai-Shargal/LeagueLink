import React from "react";
import { Box, TextField } from "@mui/material";
import { Tournament } from "../types";

interface TournamentInfoSectionProps {
  tournament: Tournament;
}

const TournamentInfoSection: React.FC<TournamentInfoSectionProps> = ({
  tournament,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        mb: 2,
        mt: 1,
        position: "sticky",
        top: 0,
        backgroundColor: "rgb(30, 41, 59)",
        zIndex: 1,
        py: 1,
      }}
    >
      <TextField
        label="Location"
        value={tournament.location}
        disabled
        sx={{
          width: "30%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgb(30, 41, 59)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
          },
        }}
      />
      <TextField
        label="Date"
        value={tournament.date}
        type="date"
        disabled
        sx={{
          width: "30%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgb(30, 41, 59)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
          },
        }}
      />
      <TextField
        label="Time"
        value={tournament.time}
        type="time"
        disabled
        sx={{
          width: "30%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgb(30, 41, 59)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
          },
        }}
      />
    </Box>
  );
};

export default TournamentInfoSection;
