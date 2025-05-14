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

// משופר - קבועים לעיצוב ומיקום סוגריים הטורניר
const MATCH_VERTICAL_GAP = 80; // הגדלת המרווח האנכי
const BRACKET_LINE_COLOR = "rgba(255, 255, 255, 0.3)"; // צבע קווי חיבור משופר

interface TournamentBracketSectionProps {
  tournament: Tournament;
  onUpdateMatch: (match: Match) => void;
}

const TournamentBracketSection: React.FC<TournamentBracketSectionProps> = ({
  tournament,
  onUpdateMatch,
}) => {
  // פונקציה משופרת להמרת נתוני משתתף לפורמט אחיד
  const normalizeParticipant = (
    participant: any
  ): DraggableParticipant | null => {
    if (!participant) return null;

    // אם זה כבר במבנה הנכון
    if (participant.userId || participant.id) {
      return {
        id: participant.id || participant.userId,
        userId: participant.userId || participant.id,
        username: participant.username || "Unknown",
        status: participant.status || "PENDING",
        profilePicture: participant.profilePicture || undefined,
      };
    }

    // אם זה מערך
    if (Array.isArray(participant)) {
      return participant.length > 0
        ? normalizeParticipant(participant[0])
        : null;
    }

    return null;
  };

  // פונקציה משופרת להצגת שם המשתתף
  const renderParticipantName = (participant: any): string => {
    const normalizedParticipant = normalizeParticipant(participant);
    return normalizedParticipant ? normalizedParticipant.username : "TBD";
  };

  // פונקציה משופרת לקבלת תמונת פרופיל של משתתף
  const getParticipantProfilePicture = (
    participant: any
  ): string | undefined => {
    const normalizedParticipant = normalizeParticipant(participant);
    return normalizedParticipant
      ? normalizedParticipant.profilePicture
      : undefined;
  };

  // פורמט תאריך לתצוגה מקומית
  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  // קביעת מנצח בהתאם לציוני המשחק
  const determineWinner = (match: Match): "team1" | "team2" | null => {
    if (match.score1 === undefined || match.score2 === undefined) return null;
    if (match.score1 > match.score2) return "team1";
    if (match.score2 > match.score1) return "team2";
    return null;
  };

  // קיבוץ משחקים לפי סיבוב
  const matchesByRound = (tournament.matches || []).reduce<{
    [key: number]: Match[];
  }>((acc: { [key: number]: Match[] }, match: Match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {});

  // מיון משחקים בכל סיבוב לפי מספר המשחק
  Object.keys(matchesByRound).forEach((round) => {
    matchesByRound[Number(round)].sort(
      (a: Match, b: Match) => a.matchNumber - b.matchNumber
    );
  });

  // חישוב מיקומי משחקים בצורה דינמית
  const calculatePositions = () => {
    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);

    rounds.forEach((round) => {
      const matches = matchesByRound[round];
      const totalMatches = matches.length;

      // חישוב גובה כולל של האזור
      const totalAreaHeight =
        totalMatches * BASE_BOX_HEIGHT +
        (totalMatches - 1) * MATCH_VERTICAL_GAP;

      matches.forEach((match, index) => {
        // מרחק אחיד בין משחקים
        const spacing = totalAreaHeight / totalMatches;
        match.verticalPosition = index * spacing;
      });
    });
  };

  // חישוב המיקומים
  calculatePositions();

  // חישוב קווי החיבור בין משחקים
  const renderConnectors = () => {
    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);
    if (rounds.length <= 1) return null;

    return rounds
      .slice(1)
      .map((round) => {
        const prevRound = round - 1;
        const currentMatches = matchesByRound[round] || [];

        return currentMatches
          .map((match) => {
            // מציאת המשחקים המקושרים מהסיבוב הקודם
            const relatedMatches = (matchesByRound[prevRound] || []).filter(
              (prevMatch) => prevMatch.nextMatchId === match.id
            );

            return relatedMatches.map((relatedMatch, idx) => {
              const startX =
                (prevRound - 1) * (BASE_BOX_WIDTH + ROUND_HORIZONTAL_GAP) +
                BASE_BOX_WIDTH;
              const startY =
                relatedMatch.verticalPosition + BASE_BOX_HEIGHT / 2;

              const endX =
                (round - 1) * (BASE_BOX_WIDTH + ROUND_HORIZONTAL_GAP);
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
          })
          .flat();
      })
      .flat();
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

      {/* תוכן הסוגריים */}
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
        {/* קווי חיבור */}
        {renderConnectors()}

        {/* סיבובים */}
        {Object.entries(matchesByRound).map(
          ([round, roundMatches]: [string, Match[]]) => (
            <Box
              key={round}
              sx={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                minWidth: BASE_BOX_WIDTH,
              }}
            >
              {/* כותרת הסיבוב */}
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

              {/* משחקים בסיבוב */}
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
                    <Tooltip
                      title="לחץ לעריכת פרטי המשחק"
                      arrow
                      placement="left"
                    >
                      <Box sx={{ width: "100%", height: "100%" }}>
                        {/* משתתף 1 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            height: "50%",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            backgroundColor:
                              winner === "team1"
                                ? "rgba(76, 175, 80, 0.1)"
                                : "transparent",
                          }}
                        >
                          <Avatar
                            src={getParticipantProfilePicture(match.team1)}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {!getParticipantProfilePicture(match.team1) && (
                              <PersonIcon />
                            )}
                          </Avatar>
                          <Typography
                            sx={{
                              flex: 1,
                              color:
                                winner === "team1"
                                  ? "rgba(76, 175, 80, 0.9)"
                                  : "rgba(255, 255, 255, 0.9)",
                              fontSize: "0.9rem",
                              fontWeight:
                                winner === "team1" ? "bold" : "normal",
                            }}
                          >
                            {renderParticipantName(match.team1)}
                            {winner === "team1" && (
                              <TrophyIcon
                                sx={{
                                  fontSize: 16,
                                  ml: 0.5,
                                  verticalAlign: "middle",
                                  color: "gold",
                                }}
                              />
                            )}
                          </Typography>
                          {match.score1 !== undefined && (
                            <Typography
                              sx={{
                                color:
                                  winner === "team1"
                                    ? "rgba(76, 175, 80, 0.9)"
                                    : "rgba(255, 255, 255, 0.9)",
                                fontSize: "0.9rem",
                                ml: 1,
                                fontWeight: "bold",
                              }}
                            >
                              {match.score1}
                            </Typography>
                          )}
                        </Box>

                        {/* משתתף 2 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            height: "50%",
                            backgroundColor:
                              winner === "team2"
                                ? "rgba(76, 175, 80, 0.1)"
                                : "transparent",
                          }}
                        >
                          <Avatar
                            src={getParticipantProfilePicture(match.team2)}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {!getParticipantProfilePicture(match.team2) && (
                              <PersonIcon />
                            )}
                          </Avatar>
                          <Typography
                            sx={{
                              flex: 1,
                              color:
                                winner === "team2"
                                  ? "rgba(76, 175, 80, 0.9)"
                                  : "rgba(255, 255, 255, 0.9)",
                              fontSize: "0.9rem",
                              fontWeight:
                                winner === "team2" ? "bold" : "normal",
                            }}
                          >
                            {renderParticipantName(match.team2)}
                            {winner === "team2" && (
                              <TrophyIcon
                                sx={{
                                  fontSize: 16,
                                  ml: 0.5,
                                  verticalAlign: "middle",
                                  color: "gold",
                                }}
                              />
                            )}
                          </Typography>
                          {match.score2 !== undefined && (
                            <Typography
                              sx={{
                                color:
                                  winner === "team2"
                                    ? "rgba(76, 175, 80, 0.9)"
                                    : "rgba(255, 255, 255, 0.9)",
                                fontSize: "0.9rem",
                                ml: 1,
                                fontWeight: "bold",
                              }}
                            >
                              {match.score2}
                            </Typography>
                          )}
                        </Box>

                        {/* מידע על תאריך המשחק אם קיים */}
                        {match.date && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              right: 2,
                              color: "rgba(255, 255, 255, 0.5)",
                              fontSize: "0.7rem",
                            }}
                          >
                            {formatDate(match.date)}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  </Paper>
                );
              })}
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default TournamentBracketSection;
