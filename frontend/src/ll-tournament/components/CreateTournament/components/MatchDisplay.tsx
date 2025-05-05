import React from "react";
import { Box, Avatar, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import { Match, DraggableParticipant } from "../../../types";

interface MatchDisplayProps {
  match: Match;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  onRemovePlayer: (isTeam1: boolean) => void;
}

export const MatchDisplay: React.FC<MatchDisplayProps> = ({
  match,
  channelUsers,
  onRemovePlayer,
}) => {
  const isGuest = (participant: DraggableParticipant) => {
    return participant.status === "guest";
  };

  const renderTeam = (team: DraggableParticipant | null, isTeam1: boolean) => {
    if (!team) return null;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Avatar
          src={
            isGuest(team)
              ? undefined
              : channelUsers.find((u) => u.id === team.userId)?.profilePicture
          }
          sx={{ width: 24, height: 24, mr: 1 }}
        >
          {isGuest(team) && <PersonIcon fontSize="small" />}
        </Avatar>
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {team.username}
        </Typography>
        <IconButton
          size="small"
          onClick={() => onRemovePlayer(isTeam1)}
          sx={{
            p: 0.5,
            color: "rgba(255, 255, 255, 0.4)",
            "&:hover": {
              color: "rgba(255, 255, 255, 0.8)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  return (
    <>
      {renderTeam(match.team1, true)}
      {renderTeam(match.team2, false)}
    </>
  );
};
