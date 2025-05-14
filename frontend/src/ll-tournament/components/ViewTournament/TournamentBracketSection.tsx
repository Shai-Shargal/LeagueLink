import React from "react";
import { Box, Typography, Paper, Avatar, Grid, Tooltip } from "@mui/material";
import {
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import {
  Tournament,
  DraggableParticipant,
  Match,
  BASE_BOX_WIDTH,
  BASE_BOX_HEIGHT,
  ROUND_HORIZONTAL_GAP,
} from "../../types";

const MATCH_VERTICAL_GAP = 80;
const BRACKET_LINE_COLOR = "rgba(255, 255, 255, 0.3)";

interface TournamentBracketSectionProps {
  tournament: Tournament;
  onUpdateMatch: (match: Match) => void;
}

const TournamentBracketSection: React.FC<TournamentBracketSectionProps> = ({
  tournament,
  onUpdateMatch,
}) => {
  const normalizeParticipant = (
    participant: any
  ): DraggableParticipant | null => {
    if (!participant || typeof participant !== "object") return null;
    if ("username" in participant) {
      return {
        id: participant.id || participant.userId,
        userId: participant.userId || participant.id,
        username: participant.username || "Unknown",
        status: participant.status || "PENDING",
        profilePicture: participant.profilePicture || undefined,
      };
    }
    return null;
  };

  const renderParticipantName = (participant: any): string => {
    const normalized = normalizeParticipant(participant);
    return normalized?.username || "TBD";
  };

  const getParticipantProfilePicture = (
    participant: any
  ): string | undefined => {
    const normalized = normalizeParticipant(participant);
    return normalized?.profilePicture;
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const determineWinner = (match: Match): "team1" | "team2" | null => {
    if (match.score1 === undefined || match.score2 === undefined) return null;
    if (match.score1 > match.score2) return "team1";
    if (match.score2 > match.score1) return "team2";
    return null;
  };

  const matchesByRound = (tournament.matches || []).reduce<{
    [key: number]: Match[];
  }>((acc, match) => {
    acc[match.round] = acc[match.round] || [];
    acc[match.round].push(match);
    return acc;
  }, {});

  Object.keys(matchesByRound).forEach((round) => {
    matchesByRound[Number(round)].sort((a, b) => a.matchNumber - b.matchNumber);
  });

  const calculatePositions = () => {
    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);

    rounds.forEach((round) => {
      const matches = matchesByRound[round];
      const totalMatches = matches.length;
      const totalAreaHeight =
        totalMatches * BASE_BOX_HEIGHT +
        (totalMatches - 1) * MATCH_VERTICAL_GAP;

      matches.forEach((match, index) => {
        const spacing = totalAreaHeight / totalMatches;
        match.verticalPosition = index * spacing;
      });
    });
  };

  calculatePositions();

  const renderConnectors = () => {
    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);
    if (rounds.length <= 1) return null;

    return rounds.slice(1).flatMap((round) => {
      const prevRound = round - 1;
      const currentMatches = matchesByRound[round] || [];

      return currentMatches.flatMap((match) => {
        const relatedMatches = (matchesByRound[prevRound] || []).filter(
          (prevMatch) => prevMatch.nextMatchId === match.id
        );

        return relatedMatches.map((relatedMatch, idx) => {
          const startX =
            (prevRound - 1) * (BASE_BOX_WIDTH + ROUND_HORIZONTAL_GAP) +
            BASE_BOX_WIDTH;
          const startY = relatedMatch.verticalPosition + BASE_BOX_HEIGHT / 2;

          const endX = (round - 1) * (BASE_BOX_WIDTH + ROUND_HORIZONTAL_GAP);
          const endY = match.verticalPosition + BASE_BOX_HEIGHT / 2;

          return (
            <Box
              key={`connector-${relatedMatch.id}-${match.id}-${idx}`}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: `${startY}px`,
                  left: `${startX}px`,
                  width: `${ROUND_HORIZONTAL_GAP / 2}px`,
                  height: "2px",
                  backgroundColor: BRACKET_LINE_COLOR,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: `${endY}px`,
                  left: `${endX - ROUND_HORIZONTAL_GAP / 2}px`,
                  width: `${ROUND_HORIZONTAL_GAP / 2}px`,
                  height: "2px",
                  backgroundColor: BRACKET_LINE_COLOR,
                },
              }}
            />
          );
        });
      });
    });
  };

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
        מסך טורניר
      </Typography>

      {/* פרטי הטורניר */}
      <Grid container spacing={2} sx={{ mb: 3, px: 2 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="white">
            תאריך התחלה: {formatDate(tournament.startDate)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="white">
            מיקום: {tournament.location || "לא צוין"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="white">
            פורמט: {tournament.format || "לא צוין"}
          </Typography>
        </Grid>
      </Grid>

      {/* סוגריים */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: ROUND_HORIZONTAL_GAP,
          p: 4,
          overflowX: "auto",
          minHeight: 600,
          position: "relative",
          minWidth: "fit-content",
        }}
      >
        {renderConnectors()}
        {Object.entries(matchesByRound).map(([round, roundMatches]) => (
          <Box
            key={round}
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              minWidth: BASE_BOX_WIDTH,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "white",
                mb: 2,
                textAlign: "center",
                fontWeight: "bold",
                opacity: 0.9,
              }}
            >
              {Number(round) === Object.keys(matchesByRound).length
                ? "גמר"
                : Number(round) === Object.keys(matchesByRound).length - 1
                  ? "חצי גמר"
                  : `סיבוב ${round}`}
            </Typography>

            {roundMatches.map((match: Match) => {
              const winner = determineWinner(match);
              return (
                <Paper
                  key={match.id}
                  elevation={2}
                  onClick={() => onUpdateMatch(match)}
                  sx={{
                    width: BASE_BOX_WIDTH,
                    height: BASE_BOX_HEIGHT,
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#242b3d",
                    borderRadius: 1,
                    position: "absolute",
                    overflow: "hidden",
                    top: match.verticalPosition || 0,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.02)",
                    },
                    cursor: "pointer",
                  }}
                >
                  <Tooltip title="לחץ לעריכת פרטי המשחק" arrow placement="left">
                    <Box sx={{ width: "100%", height: "100%" }}>
                      {[match.team1, match.team2].map((team, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            height: "50%",
                            borderBottom:
                              idx === 0
                                ? "1px solid rgba(255, 255, 255, 0.1)"
                                : "none",
                            backgroundColor:
                              (winner === "team1" && idx === 0) ||
                              (winner === "team2" && idx === 1)
                                ? "rgba(76, 175, 80, 0.1)"
                                : "transparent",
                          }}
                        >
                          <Avatar
                            src={getParticipantProfilePicture(team)}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {!getParticipantProfilePicture(team) && (
                              <PersonIcon />
                            )}
                          </Avatar>
                          <Typography
                            sx={{
                              flex: 1,
                              color:
                                (winner === "team1" && idx === 0) ||
                                (winner === "team2" && idx === 1)
                                  ? "rgba(76, 175, 80, 0.9)"
                                  : "rgba(255, 255, 255, 0.9)",
                              fontSize: "0.9rem",
                              fontWeight:
                                (winner === "team1" && idx === 0) ||
                                (winner === "team2" && idx === 1)
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {renderParticipantName(team)}
                            {(winner === "team1" && idx === 0) ||
                            (winner === "team2" && idx === 1) ? (
                              <TrophyIcon
                                sx={{
                                  fontSize: 16,
                                  ml: 0.5,
                                  verticalAlign: "middle",
                                  color: "gold",
                                }}
                              />
                            ) : null}
                          </Typography>
                          {typeof (idx === 0 ? match.score1 : match.score2) ===
                            "number" && (
                            <Typography
                              sx={{
                                fontSize: "0.9rem",
                                ml: 1,
                                fontWeight: "bold",
                                color:
                                  (winner === "team1" && idx === 0) ||
                                  (winner === "team2" && idx === 1)
                                    ? "rgba(76, 175, 80, 0.9)"
                                    : "rgba(255, 255, 255, 0.9)",
                              }}
                            >
                              {idx === 0 ? match.score1 : match.score2}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Tooltip>
                </Paper>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TournamentBracketSection;
