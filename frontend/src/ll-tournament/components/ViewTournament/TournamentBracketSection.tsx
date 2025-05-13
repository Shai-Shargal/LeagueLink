import React from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { Tournament } from "../../types";

// Constants for bracket layout
const ROUND_HORIZONTAL_GAP = 100;
const MATCH_VERTICAL_GAP = 40;
const BASE_BOX_WIDTH = 200;
const BASE_BOX_HEIGHT = 100;

interface TournamentBracketSectionProps {
  tournament: Tournament;
  onUpdateMatch: (match: any) => void;
}

const TournamentBracketSection: React.FC<TournamentBracketSectionProps> = ({
  tournament,
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        mt: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "white",
          mb: 2,
          position: "sticky",
          top: 0,
          backgroundColor: "rgb(30, 41, 59)",
          zIndex: 1,
          py: 1,
        }}
      >
        Tournament Bracket
      </Typography>

      {/* Bracket Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: ROUND_HORIZONTAL_GAP,
          p: 2,
          overflowX: "auto",
          minHeight: 400,
          position: "relative",
          minWidth: "fit-content",
        }}
      >
        {tournament.matches && tournament.matches.length > 0 ? (
          Object.entries(
            tournament.matches.reduce(
              (acc, match) => {
                if (!acc[match.round]) {
                  acc[match.round] = [];
                }
                acc[match.round].push(match);
                return acc;
              },
              {} as { [key: number]: typeof tournament.matches }
            )
          ).map(([round, roundMatches]) => (
            <Box
              key={round}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: MATCH_VERTICAL_GAP,
                alignItems: "flex-start",
                minWidth: BASE_BOX_WIDTH,
              }}
            >
              {roundMatches.map((match) => (
                <Paper
                  key={match.id}
                  elevation={1}
                  sx={{
                    width: BASE_BOX_WIDTH,
                    height: BASE_BOX_HEIGHT,
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#242b3d",
                    borderRadius: 1,
                    position: "relative",
                    overflow: "hidden",
                    marginTop: match.position?.y ? `${match.position.y}px` : 0,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      right: -ROUND_HORIZONTAL_GAP,
                      top: "50%",
                      width: ROUND_HORIZONTAL_GAP,
                      height: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      height: "50%",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Avatar
                      src={match.team1?.avatar}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {!match.team1?.avatar && <PersonIcon />}
                    </Avatar>
                    <Typography
                      sx={{
                        flex: 1,
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {match.team1?.username || "TBD"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      height: "50%",
                    }}
                  >
                    <Avatar
                      src={match.team2?.profilePicture}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {!match.team2?.profilePicture && <PersonIcon />}
                    </Avatar>
                    <Typography
                      sx={{
                        flex: 1,
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {match.team2?.username || "TBD"}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ))
        ) : (
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            No matches in this tournament
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TournamentBracketSection;
