import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Avatar,
  Alert,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import {
  Tournament,
  GuestUser,
  Match,
  TournamentParticipant,
  ParticipantStatus,
} from "../types";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import { v4 as uuidv4 } from "uuid";

interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newTournament: Partial<Tournament>;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  isCreating: boolean;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 800;
const GAMES_AREA_HEIGHT = 600;
const BASE_BOX_HEIGHT = 100;
const BASE_BOX_WIDTH = 200;
const MATCH_VERTICAL_GAP = 16;
const ROUND_HORIZONTAL_GAP = 60;
const INITIAL_TOP_MARGIN = 40;

interface DraggableParticipant extends TournamentParticipant {
  type: "channel" | "guest";
}

const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  newTournament,
  onTournamentChange,
  channelUsers,
  isCreating,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [newGuestUsername, setNewGuestUsername] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedParticipant, setDraggedParticipant] =
    useState<DraggableParticipant | null>(null);
  const [pendingMatch, setPendingMatch] = useState<{
    participant1?: DraggableParticipant;
    participant2?: DraggableParticipant;
  }>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newTournament.name?.trim()) {
      newErrors.name = "Tournament name is required";
    } else if (newTournament.name.trim().length < 3) {
      newErrors.name = "Tournament name must be at least 3 characters";
    }

    if (!newTournament.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!newTournament.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(newTournament.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    if (!newTournament.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Add guest users to the tournament participants
      const guestParticipants = guestUsers.map((guest) => ({
        id: `guest_${guest.username}`,
        userId: `guest_${guest.username}`,
        username: guest.username,
        status: ParticipantStatus.PENDING,
        stats: {},
        isGuest: true,
      }));

      // Update tournament data
      if (newTournament.name) {
        onTournamentChange("name", newTournament.name.trim());
      }
      if (newTournament.location) {
        onTournamentChange("location", newTournament.location.trim());
      }

      // Handle date and time
      if (newTournament.date && newTournament.time) {
        // Parse the date and time inputs
        const [year, month, day] = newTournament.date.split("-").map(Number);
        const [hours, minutes] = newTournament.time.split(":").map(Number);

        // Create a new Date object (months are 0-based in JavaScript)
        const date = new Date(year, month - 1, day, hours, minutes);

        // Only update if we got a valid date
        if (!isNaN(date.getTime())) {
          onTournamentChange("date", newTournament.date);
          onTournamentChange("time", newTournament.time);
        }
      }

      // Handle matches
      const formattedMatches = matches.map((match) => ({
        id: match.id,
        round: match.round || 1,
        matchNumber: match.matchNumber || matches.indexOf(match) + 1,
        team1: match.team1
          ? {
              userId: match.team1.userId,
              username: match.team1.username,
              isGuest: match.team1.isGuest || false,
              status: match.team1.status || ParticipantStatus.PENDING,
            }
          : null,
        team2: match.team2
          ? {
              userId: match.team2.userId,
              username: match.team2.username,
              isGuest: match.team2.isGuest || false,
              status: match.team2.status || ParticipantStatus.PENDING,
            }
          : null,
        position: match.position || {
          x: (match.round - 1) * 220,
          y: match.matchNumber * 100,
        },
        score1: 0,
        score2: 0,
        winner: null,
      }));

      onTournamentChange("participants", [
        ...(newTournament.participants || []),
        ...guestParticipants,
      ]);
      onTournamentChange("matches", formattedMatches);

      onSubmit();
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setErrors({});
      setGuestUsers([]);
      setNewGuestUsername("");
      onClose();
    }
  };

  const handleAddGuest = () => {
    if (newGuestUsername.trim()) {
      setGuestUsers([
        ...guestUsers,
        {
          username: newGuestUsername.trim(),
        },
      ]);
      setNewGuestUsername("");
      setGuestDialogOpen(false);
    }
  };

  const removeGuestUser = (index: number) => {
    setGuestUsers(guestUsers.filter((_, i) => i !== index));
  };

  const handleDragStart = (participant: DraggableParticipant) => {
    setDraggedParticipant(participant);
  };

  const handleDragEnd = () => {
    setDraggedParticipant(null);
  };

  const handleDrop = (e: React.DragEvent, existingMatchId?: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (!draggedParticipant) return;

    // Get drop position relative to the tournament area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If dropping into an existing match
    if (existingMatchId) {
      setMatches((prevMatches) => {
        return prevMatches.map((match) => {
          if (match.id === existingMatchId) {
            // Check if player is already in this match
            if (
              match.team1?.userId === draggedParticipant.userId ||
              match.team2?.userId === draggedParticipant.userId
            ) {
              return match;
            }

            // Add to empty team1 slot
            if (!match.team1) {
              return { ...match, team1: draggedParticipant };
            }

            // Add to empty team2 slot
            if (!match.team2) {
              return { ...match, team2: draggedParticipant };
            }
          }
          return match;
        });
      });
      return; // Important: exit here to prevent creating new match
    }

    // Only create new match if not dropping into existing one
    if (!pendingMatch.participant1) {
      setPendingMatch({ participant1: draggedParticipant });
    } else if (
      !pendingMatch.participant2 &&
      draggedParticipant.userId !== pendingMatch.participant1.userId
    ) {
      const newMatch: Match = {
        id: uuidv4(),
        round: 1,
        matchNumber: matches.length + 1,
        team1: pendingMatch.participant1,
        team2: draggedParticipant,
        position: {
          x,
          y,
        },
      };
      setMatches((prevMatches) => [...prevMatches, newMatch]);
      setPendingMatch({});
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeMatch = (matchId: string) => {
    setMatches(matches.filter((match) => match.id !== matchId));
  };

  const removePlayerFromMatch = (matchId: string, isTeam1: boolean) => {
    const updatedMatches = matches.reduce<Match[]>((acc, match) => {
      if (match.id === matchId) {
        // If this will be the last player removed, don't include the match at all
        if ((isTeam1 && !match.team2) || (!isTeam1 && !match.team1)) {
          return acc; // Skip this match entirely
        }
        // Otherwise, create new match with one player removed
        return [
          ...acc,
          {
            ...match,
            team1: isTeam1 ? null : match.team1,
            team2: isTeam1 ? match.team2 : null,
          } as Match,
        ];
      }
      return [...acc, match];
    }, []);

    setMatches(updatedMatches);
  };

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as { [key: number]: Match[] });

  // Fix the spread operator type error by explicitly typing the style objects
  const emptySlotStyle = {
    border: "1px dashed",
    borderColor: "primary.main",
    m: 1,
    borderRadius: 1,
    backgroundColor: "rgba(147, 51, 234, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as const;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: DIALOG_WIDTH,
            height: DIALOG_HEIGHT,
            borderRadius: 3,
            boxShadow: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 0,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            "&.MuiDialogTitle-root": {
              fontSize: "1rem",
              padding: "8px 16px",
              minHeight: "auto",
            },
            fontWeight: 500,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: (theme) => theme.palette.background.paper,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          Create New Tournament
        </DialogTitle>
        <DialogContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            p: 2,
            overflowY: "auto",
            background: (theme) => theme.palette.background.paper,
            "&.MuiDialogContent-root": {
              paddingTop: "16px",
            },
          }}
        >
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fill in all required fields
            </Alert>
          )}
          <Stack spacing={3} sx={{ width: "100%" }}>
            <TextField
              label="Tournament Name"
              value={newTournament.name}
              onChange={(e) => onTournamentChange("name", e.target.value)}
              fullWidth
              disabled={isCreating}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <TextField
                label="Location"
                value={newTournament.location}
                onChange={(e) => onTournamentChange("location", e.target.value)}
                fullWidth
                disabled={isCreating}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
              <TextField
                label="Date"
                type="date"
                value={newTournament.date}
                onChange={(e) => onTournamentChange("date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isCreating}
                error={!!errors.date}
                helperText={errors.date}
                required
              />
              <TextField
                label="Time"
                type="time"
                value={newTournament.time}
                onChange={(e) => onTournamentChange("time", e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isCreating}
                error={!!errors.time}
                helperText={errors.time}
                required
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flex: 1,
                gap: 3,
                minHeight: GAMES_AREA_HEIGHT,
              }}
            >
              <Paper
                sx={{
                  flex: 7,
                  minWidth: 0,
                  height: GAMES_AREA_HEIGHT,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  border: "2px dashed rgba(147, 51, 234, 0.5)",
                  background: "#1a2234",
                  color: "text.secondary",
                  mr: 2,
                  overflowY: "auto",
                  overflowX: "auto",
                  p: 2,
                  position: "relative",
                  borderRadius: 2,
                }}
                elevation={0}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Typography
                  variant="body1"
                  color="rgba(255, 255, 255, 0.7)"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    fontSize: "1.1rem",
                    textAlign: "center",
                    pointerEvents: "none",
                    opacity: matches.length === 0 ? 1 : 0,
                  }}
                >
                  {pendingMatch.participant1
                    ? "Drop another participant to create a match"
                    : "Drag participants here to create matches"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: ROUND_HORIZONTAL_GAP,
                    p: 2,
                    minWidth: "fit-content",
                    mt: `${INITIAL_TOP_MARGIN}px`,
                    position: "relative",
                    width: "100%",
                    minHeight: "100%",
                  }}
                >
                  {/* First Round Column */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: MATCH_VERTICAL_GAP,
                      alignItems: "flex-start",
                      width: "100%",
                    }}
                  >
                    {/* Existing Matches */}
                    {matches
                      .filter((match) => match.round === 1)
                      .map((match, index) => (
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
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                            },
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              right: -ROUND_HORIZONTAL_GAP,
                              top: "50%",
                              width: ROUND_HORIZONTAL_GAP,
                              height: 2,
                              backgroundColor: "rgba(147, 51, 234, 0.3)",
                            },
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => handleDrop(e, match.id)}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              height: "50%",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                              position: "relative",
                              ...(!match.team1 ? emptySlotStyle : {}),
                            }}
                          >
                            {match.team1 ? (
                              <>
                                <Avatar
                                  src={
                                    match.team1.isGuest
                                      ? undefined
                                      : channelUsers.find(
                                          (u) => u.id === match.team1?.userId
                                        )?.profilePicture
                                  }
                                  sx={{ width: 40, height: 40, mr: 2 }}
                                >
                                  {match.team1.isGuest && <PersonIcon />}
                                </Avatar>
                                <Typography
                                  sx={{
                                    flex: 1,
                                    color: "rgba(255, 255, 255, 0.9)",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {match.team1.username}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePlayerFromMatch(match.id, true);
                                  }}
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    color: "rgba(255, 255, 255, 0.7)",
                                    "&:hover": {
                                      color: "white",
                                      backgroundColor: "rgba(255,255,255,0.08)",
                                    },
                                    padding: 0.5,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <AddIcon
                                sx={{
                                  fontSize: 24,
                                  color: "primary.main",
                                  animation: "pulse 1.5s infinite",
                                  "@keyframes pulse": {
                                    "0%": {
                                      transform: "scale(1)",
                                      opacity: 0.7,
                                    },
                                    "50%": {
                                      transform: "scale(1.2)",
                                      opacity: 1,
                                    },
                                    "100%": {
                                      transform: "scale(1)",
                                      opacity: 0.7,
                                    },
                                  },
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              height: "50%",
                              position: "relative",
                              ...(!match.team2 ? emptySlotStyle : {}),
                            }}
                          >
                            {match.team2 ? (
                              <>
                                <Avatar
                                  src={
                                    match.team2.isGuest
                                      ? undefined
                                      : channelUsers.find(
                                          (u) => u.id === match.team2?.userId
                                        )?.profilePicture
                                  }
                                  sx={{ width: 40, height: 40, mr: 2 }}
                                >
                                  {match.team2.isGuest && <PersonIcon />}
                                </Avatar>
                                <Typography
                                  sx={{
                                    flex: 1,
                                    color: "rgba(255, 255, 255, 0.9)",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {match.team2.username}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePlayerFromMatch(match.id, false);
                                  }}
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    color: "rgba(255, 255, 255, 0.7)",
                                    "&:hover": {
                                      color: "white",
                                      backgroundColor: "rgba(255,255,255,0.08)",
                                    },
                                    padding: 0.5,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <AddIcon
                                sx={{
                                  fontSize: 24,
                                  color: "primary.main",
                                  animation: "pulse 1.5s infinite",
                                  "@keyframes pulse": {
                                    "0%": {
                                      transform: "scale(1)",
                                      opacity: 0.7,
                                    },
                                    "50%": {
                                      transform: "scale(1.2)",
                                      opacity: 1,
                                    },
                                    "100%": {
                                      transform: "scale(1)",
                                      opacity: 0.7,
                                    },
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Paper>
                      ))}

                    {/* Pending Match - Always at the bottom of first round */}
                    {pendingMatch.participant1 && (
                      <Paper
                        elevation={1}
                        className="css-95vexv-MuiPaper-root"
                        sx={{
                          width: BASE_BOX_WIDTH,
                          height: BASE_BOX_HEIGHT,
                          display: "flex",
                          flexDirection: "column",
                          backgroundColor: "#242b3d",
                          borderRadius: 1,
                          position: "relative",
                          overflow: "hidden",
                          opacity: 1,
                          boxShadow:
                            "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
                          border: "2px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            height: "50%",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            backgroundColor: "#2a3447",
                          }}
                        >
                          <Avatar
                            src={
                              pendingMatch.participant1.isGuest
                                ? undefined
                                : channelUsers.find(
                                    (u) =>
                                      u.id === pendingMatch.participant1?.userId
                                  )?.profilePicture
                            }
                            sx={{ width: 40, height: 40, mr: 2 }}
                          >
                            {pendingMatch.participant1.isGuest && (
                              <PersonIcon />
                            )}
                          </Avatar>
                          <Typography
                            sx={{
                              flex: 1,
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {pendingMatch.participant1.username}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "50%",
                            border: "1px dashed",
                            borderColor: "primary.main",
                            m: 1,
                            borderRadius: 1,
                            color: "primary.main",
                            backgroundColor: "rgba(147, 51, 234, 0.1)",
                          }}
                        >
                          <AddIcon
                            sx={{
                              fontSize: 24,
                              animation: "pulse 1.5s infinite",
                              "@keyframes pulse": {
                                "0%": {
                                  transform: "scale(1)",
                                  opacity: 0.7,
                                },
                                "50%": {
                                  transform: "scale(1.2)",
                                  opacity: 1,
                                },
                                "100%": {
                                  transform: "scale(1)",
                                  opacity: 0.7,
                                },
                              },
                            }}
                          />
                        </Box>
                      </Paper>
                    )}
                  </Box>

                  {/* Second Round and Later */}
                  {Object.entries(matchesByRound)
                    .filter(([round]) => Number(round) > 1)
                    .map(([round, roundMatches]) => (
                      <Box
                        key={round}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: MATCH_VERTICAL_GAP,
                          alignItems: "flex-start",
                        }}
                      >
                        {roundMatches.map((match) => (
                          <Paper
                            key={match.id}
                            elevation={1}
                            className="css-95vexv-MuiPaper-root"
                            sx={{
                              width: BASE_BOX_WIDTH,
                              height: BASE_BOX_HEIGHT,
                              display: "flex",
                              flexDirection: "column",
                              backgroundColor: "#242b3d",
                              borderRadius: 1,
                              position: "relative",
                              overflow: "hidden",
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                right: -ROUND_HORIZONTAL_GAP,
                                top: "50%",
                                width: ROUND_HORIZONTAL_GAP,
                                height: 2,
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              // Add specific styling for odd-numbered participants
                              "&:nth-of-type(odd)": {
                                backgroundColor: "#2a3447",
                                boxShadow:
                                  "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
                              },
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => handleDrop(e, match.id)}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                height: "50%",
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.1)",
                                position: "relative",
                                ...(!match.team1 ? emptySlotStyle : {}),
                              }}
                            >
                              {match.team1 ? (
                                <>
                                  <Avatar
                                    src={
                                      match.team1.isGuest
                                        ? undefined
                                        : channelUsers.find(
                                            (u) => u.id === match.team1?.userId
                                          )?.profilePicture
                                    }
                                    sx={{ width: 40, height: 40, mr: 2 }}
                                  >
                                    {match.team1.isGuest && <PersonIcon />}
                                  </Avatar>
                                  <Typography
                                    sx={{
                                      flex: 1,
                                      color: "rgba(255, 255, 255, 0.9)",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {match.team1.username}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePlayerFromMatch(match.id, true);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      top: 4,
                                      right: 4,
                                      color: "rgba(255, 255, 255, 0.7)",
                                      "&:hover": {
                                        color: "white",
                                        backgroundColor:
                                          "rgba(255,255,255,0.08)",
                                      },
                                      padding: 0.5,
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              ) : (
                                <AddIcon
                                  sx={{
                                    fontSize: 24,
                                    color: "primary.main",
                                    animation: "pulse 1.5s infinite",
                                    "@keyframes pulse": {
                                      "0%": {
                                        transform: "scale(1)",
                                        opacity: 0.7,
                                      },
                                      "50%": {
                                        transform: "scale(1.2)",
                                        opacity: 1,
                                      },
                                      "100%": {
                                        transform: "scale(1)",
                                        opacity: 0.7,
                                      },
                                    },
                                  }}
                                />
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                height: "50%",
                                position: "relative",
                                ...(!match.team2 ? emptySlotStyle : {}),
                              }}
                            >
                              {match.team2 ? (
                                <>
                                  <Avatar
                                    src={
                                      match.team2.isGuest
                                        ? undefined
                                        : channelUsers.find(
                                            (u) => u.id === match.team2?.userId
                                          )?.profilePicture
                                    }
                                    sx={{ width: 40, height: 40, mr: 2 }}
                                  >
                                    {match.team2.isGuest && <PersonIcon />}
                                  </Avatar>
                                  <Typography
                                    sx={{
                                      flex: 1,
                                      color: "rgba(255, 255, 255, 0.9)",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {match.team2.username}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePlayerFromMatch(match.id, false);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      top: 4,
                                      right: 4,
                                      color: "rgba(255, 255, 255, 0.7)",
                                      "&:hover": {
                                        color: "white",
                                        backgroundColor:
                                          "rgba(255,255,255,0.08)",
                                      },
                                      padding: 0.5,
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              ) : (
                                <AddIcon
                                  sx={{
                                    fontSize: 24,
                                    color: "primary.main",
                                    animation: "pulse 1.5s infinite",
                                    "@keyframes pulse": {
                                      "0%": {
                                        transform: "scale(1)",
                                        opacity: 0.7,
                                      },
                                      "50%": {
                                        transform: "scale(1.2)",
                                        opacity: 1,
                                      },
                                      "100%": {
                                        transform: "scale(1)",
                                        opacity: 0.7,
                                      },
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ))}
                </Box>
              </Paper>

              <Paper
                sx={{
                  flex: 3,
                  minWidth: 280,
                  height: GAMES_AREA_HEIGHT,
                  background: "#242b3d",
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  alignItems: "stretch",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                elevation={0}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "white",
                    fontSize: "1.1rem",
                  }}
                >
                  Channel Participants
                </Typography>
                {channelUsers.map((user) => (
                  <Box
                    key={user.id}
                    draggable
                    onDragStart={() =>
                      handleDragStart({
                        id: user.id,
                        userId: user.id,
                        username: user.username,
                        status: ParticipantStatus.PENDING,
                        stats: {},
                        type: "channel",
                      })
                    }
                    onDragEnd={handleDragEnd}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      p: 1,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                      backgroundColor:
                        draggedParticipant?.userId === user.id
                          ? "rgba(255, 255, 255, 0.1)"
                          : "transparent",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <Avatar
                      src={user.profilePicture}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Typography
                      sx={{
                        flex: 1,
                        color: "white",
                      }}
                    >
                      {user.username}
                    </Typography>
                  </Box>
                ))}

                <Divider
                  sx={{
                    my: 3,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "white",
                    fontSize: "1.1rem",
                  }}
                >
                  Guest Participants
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setGuestDialogOpen(true)}
                  sx={{
                    mb: 2,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  Add Guest Participant
                </Button>

                {guestUsers.map((guest, index) => (
                  <Box
                    key={index}
                    draggable
                    onDragStart={() =>
                      handleDragStart({
                        id: `guest_${guest.username}`,
                        userId: `guest_${guest.username}`,
                        username: guest.username,
                        status: ParticipantStatus.PENDING,
                        stats: {},
                        type: "guest",
                        isGuest: true,
                      })
                    }
                    onDragEnd={handleDragEnd}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      p: 1,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                      backgroundColor:
                        draggedParticipant?.userId === `guest_${guest.username}`
                          ? "rgba(255, 255, 255, 0.1)"
                          : "transparent",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Typography
                      sx={{
                        flex: 1,
                        color: "white",
                      }}
                    >
                      {guest.username}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeGuestUser(index)}
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        "&:hover": {
                          color: "rgba(255, 255, 255, 0.8)",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Paper>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: "divider",
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Button onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating}
            sx={{
              minWidth: 200,
              height: 48,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(45deg, #C680E3, #9333EA)",
              "&:hover": {
                background: "linear-gradient(45deg, #9333EA, #7928CA)",
              },
            }}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            Create Tournament
          </Button>
        </DialogActions>
      </Dialog>

      {/* Guest User Dialog */}
      <Dialog
        open={guestDialogOpen}
        onClose={() => {
          setGuestDialogOpen(false);
          setNewGuestUsername("");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Guest Participant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Guest Username"
            type="text"
            fullWidth
            value={newGuestUsername}
            onChange={(e) => setNewGuestUsername(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddGuest();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setGuestDialogOpen(false);
              setNewGuestUsername("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddGuest}
            variant="contained"
            disabled={!newGuestUsername.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateTournamentDialog;
