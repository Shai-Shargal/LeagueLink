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
  Tooltip,
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
import SaveIcon from "@mui/icons-material/Save";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import { v4 as uuidv4 } from "uuid";

interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournamentData: any) => void;
  newTournament: Partial<Tournament>;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  isCreating: boolean;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 800;
const GAMES_AREA_HEIGHT = 600;
const BASE_BOX_WIDTH = 220;
const BASE_BOX_HEIGHT = 120;
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
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null);
  const [pendingMatch, setPendingMatch] = useState<{
    participant1?: DraggableParticipant;
    participant2?: DraggableParticipant;
  }>({});
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [newMatchPosition, setNewMatchPosition] = useState({ x: 0, y: 0 });
  const [matchHistory, setMatchHistory] = useState<Match[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Format the date and time
      const [year, month, day] = newTournament.date?.split("-") || [];
      const [hours, minutes] = newTournament.time?.split(":") || [];
      const formattedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      console.log("Original date:", newTournament.date);
      console.log("Original time:", newTournament.time);
      console.log("Formatted date:", formattedDate);

      // Format matches for submission
      const formattedMatches = matches.map((match) => ({
        id: match.id,
        round: match.round,
        matchNumber: match.matchNumber,
        team1: match.team1 ? { userId: match.team1.userId } : null,
        team2: match.team2 ? { userId: match.team2.userId } : null,
        position: match.position,
        score1: 0,
        score2: 0,
        winner: null,
      }));

      console.log("Original matches:", matches);
      console.log("Formatted matches:", formattedMatches);

      const tournamentData = {
        name: newTournament.name,
        location: newTournament.location,
        startDate: formattedDate.toISOString(),
        format: "single elimination",
        participants: [
          ...(newTournament.participants || []),
          ...guestUsers.map((guest) => ({
            id: `guest_${guest.username}`,
            userId: `guest_${guest.username}`,
            username: guest.username,
            status: ParticipantStatus.PENDING,
            stats: {},
            isGuest: true,
          })),
        ],
        matches: formattedMatches,
      };

      console.log("Submitting tournament data:", tournamentData);

      await onSubmit(tournamentData);
      onClose();
    } catch (error) {
      console.error("Error creating tournament:", error);
      setErrors({
        name: "Failed to create tournament. Please try again.",
      });
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

  const handleDrop = (
    e: React.DragEvent,
    matchId: string,
    isTeam1: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedParticipant) return;

    setMatches(
      matches.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            team1: isTeam1 ? draggedParticipant : match.team1,
            team2: !isTeam1 ? draggedParticipant : match.team2,
          };
        }
        return match;
      })
    );
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

  const addEmptyMatch = (round: number) => {
    const newMatch: Match = {
      id: uuidv4(),
      round: round,
      matchNumber: matches.filter((m) => m.round === round).length + 1,
      team1: null as any,
      team2: null as any,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y:
          matches.filter((m) => m.round === round).length *
            (BASE_BOX_HEIGHT + MATCH_VERTICAL_GAP) +
          INITIAL_TOP_MARGIN,
      },
    };
    setMatches([...matches, newMatch]);
  };

  const handleMatchDragStart = (match: Match) => {
    setDraggedMatch(match);
  };

  const handleMatchDragEnd = () => {
    setDraggedMatch(null);
  };

  const handleMatchDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedMatch) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the round based on x position
    const round = Math.floor(x / ROUND_HORIZONTAL_GAP) + 1;

    // Update the match position
    const updatedMatch = {
      ...draggedMatch,
      round: round,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y: y - INITIAL_TOP_MARGIN,
      },
    };

    setMatches(
      matches.map((m) => (m.id === draggedMatch.id ? updatedMatch : m))
    );
  };

  const handleMatchDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddMatchClick = () => {
    setIsCreatingMatch(true);
  };

  const handleMatchCreation = (e: React.MouseEvent) => {
    if (!isCreatingMatch) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the round based on x position
    const round = Math.floor(x / ROUND_HORIZONTAL_GAP) + 1;

    const newMatch: Match = {
      id: uuidv4(),
      round: round,
      matchNumber: matches.filter((m) => m.round === round).length + 1,
      team1: null as any,
      team2: null as any,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y: y - INITIAL_TOP_MARGIN,
      },
    };

    setMatches([...matches, newMatch]);
    setIsCreatingMatch(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreatingMatch) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNewMatchPosition({ x, y });
  };

  const addToHistory = (newMatches: Match[]) => {
    const newHistory = matchHistory.slice(0, historyIndex + 1);
    newHistory.push([...newMatches]);
    setMatchHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMatches([...matchHistory[historyIndex - 1]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < matchHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMatches([...matchHistory[historyIndex + 1]]);
    }
  };

  const clearAllMatches = () => {
    addToHistory([]);
    setMatches([]);
  };

  const autoArrangeMatches = () => {
    const arrangedMatches = matches.map((match, index) => ({
      ...match,
      position: {
        x: (match.round - 1) * ROUND_HORIZONTAL_GAP,
        y: index * (BASE_BOX_HEIGHT + MATCH_VERTICAL_GAP) + INITIAL_TOP_MARGIN,
      },
    }));
    addToHistory(arrangedMatches);
    setMatches(arrangedMatches);
  };

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Create New Tournament</Typography>
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1,
              backgroundColor: "rgba(16, 20, 30, 0.7)",
              backdropFilter: "blur(8px)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Add Match">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddMatchClick}
                  sx={{
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor: "rgba(147, 51, 234, 0.08)",
                    },
                  }}
                >
                  Add Match
                </Button>
              </Tooltip>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Undo">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    sx={{ color: "text.secondary" }}
                  >
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Redo">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleRedo}
                    disabled={historyIndex >= matchHistory.length - 1}
                    sx={{ color: "text.secondary" }}
                  >
                    <RedoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Auto-arrange Matches">
                <IconButton
                  size="small"
                  onClick={autoArrangeMatches}
                  disabled={matches.length === 0}
                  sx={{ color: "text.secondary" }}
                >
                  <AutoFixHighIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear All Matches">
                <IconButton
                  size="small"
                  onClick={clearAllMatches}
                  disabled={matches.length === 0}
                  sx={{ color: "text.secondary" }}
                >
                  <DeleteSweepIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {matches.length} matches
              </Typography>
            </Box>
          </Paper>
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
              {errors.name}
            </Alert>
          )}
          <Stack spacing={3} sx={{ width: "100%" }}>
            <TextField
              label="Tournament Name"
              value={newTournament.name || ""}
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
                value={newTournament.location || ""}
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
                value={newTournament.date || ""}
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
                value={newTournament.time || ""}
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
                  justifyContent: "flex-start",
                  border: "2px dashed",
                  borderColor: "divider",
                  background: "transparent",
                  color: "text.secondary",
                  mr: 2,
                  overflowY: "auto",
                  position: "relative",
                }}
                elevation={0}
                onDrop={handleMatchDrop}
                onDragOver={handleMatchDragOver}
                onClick={handleMatchCreation}
                onMouseMove={handleMouseMove}
              >
                {/* Floating match preview */}
                {isCreatingMatch && (
                  <Paper
                    sx={{
                      position: "absolute",
                      left: newMatchPosition.x - BASE_BOX_WIDTH / 2,
                      top: newMatchPosition.y - BASE_BOX_HEIGHT / 2,
                      width: BASE_BOX_WIDTH,
                      height: BASE_BOX_HEIGHT,
                      p: 2,
                      cursor: "crosshair",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "2px dashed",
                      borderColor: "primary.main",
                      opacity: 0.7,
                      pointerEvents: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">New Match</Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">TBD vs TBD</Typography>
                    </Box>
                  </Paper>
                )}

                {matches.map((match) => (
                  <Paper
                    key={match.id}
                    draggable
                    onDragStart={() => handleMatchDragStart(match)}
                    onDragEnd={handleMatchDragEnd}
                    sx={{
                      position: "absolute",
                      left: match.position?.x || 0,
                      top: match.position?.y || 0,
                      width: BASE_BOX_WIDTH,
                      height: BASE_BOX_HEIGHT,
                      p: 2,
                      cursor: "move",
                      backgroundColor: "rgba(30, 35, 45, 0.95)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      "&:hover": {
                        backgroundColor: "rgba(35, 40, 50, 0.95)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
                        transition: "all 0.2s ease",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flex: 1,
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {/* Team 1 Box */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          backgroundColor: match.team1
                            ? "rgba(147, 51, 234, 0.15)"
                            : "rgba(255, 255, 255, 0.03)",
                          border: match.team1
                            ? "1px solid rgba(147, 51, 234, 0.2)"
                            : "1px dashed rgba(255, 255, 255, 0.1)",
                          minHeight: 40,
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: match.team1
                              ? "rgba(147, 51, 234, 0.2)"
                              : "rgba(255, 255, 255, 0.05)",
                            borderColor: match.team1
                              ? "rgba(147, 51, 234, 0.3)"
                              : "rgba(255, 255, 255, 0.2)",
                          },
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => handleDrop(e, match.id, true)}
                      >
                        {match.team1 ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Avatar
                              src={
                                match.team1.isGuest
                                  ? undefined
                                  : channelUsers.find(
                                      (u) => u.id === match.team1?.userId
                                    )?.profilePicture
                              }
                              sx={{ width: 24, height: 24, mr: 1 }}
                            >
                              {match.team1.isGuest && (
                                <PersonIcon fontSize="small" />
                              )}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                fontWeight: 500,
                                color: "rgba(255, 255, 255, 0.95)",
                              }}
                            >
                              {match.team1.username}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                removePlayerFromMatch(match.id, true)
                              }
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
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.4)",
                              fontSize: "0.85rem",
                            }}
                          >
                            Drop participant here
                          </Typography>
                        )}
                      </Box>

                      {/* VS Divider */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 1,
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255, 255, 255, 0.4)",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          VS
                        </Typography>
                      </Box>

                      {/* Team 2 Box */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          backgroundColor: match.team2
                            ? "rgba(59, 130, 246, 0.15)"
                            : "rgba(255, 255, 255, 0.03)",
                          border: match.team2
                            ? "1px solid rgba(59, 130, 246, 0.2)"
                            : "1px dashed rgba(255, 255, 255, 0.1)",
                          minHeight: 40,
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: match.team2
                              ? "rgba(59, 130, 246, 0.2)"
                              : "rgba(255, 255, 255, 0.05)",
                            borderColor: match.team2
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(255, 255, 255, 0.2)",
                          },
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => handleDrop(e, match.id, false)}
                      >
                        {match.team2 ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Avatar
                              src={
                                match.team2.isGuest
                                  ? undefined
                                  : channelUsers.find(
                                      (u) => u.id === match.team2?.userId
                                    )?.profilePicture
                              }
                              sx={{ width: 24, height: 24, mr: 1 }}
                            >
                              {match.team2.isGuest && (
                                <PersonIcon fontSize="small" />
                              )}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                fontWeight: 500,
                                color: "rgba(255, 255, 255, 0.95)",
                              }}
                            >
                              {match.team2.username}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                removePlayerFromMatch(match.id, false)
                              }
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
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.4)",
                              fontSize: "0.85rem",
                            }}
                          >
                            Drop participant here
                          </Typography>
                        )}
                      </Box>

                      {/* Delete Match Button */}
                      <IconButton
                        size="small"
                        onClick={() => removeMatch(match.id)}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          width: 24,
                          height: 24,
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
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
