import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { v4 as uuidv4 } from "uuid";

import {
  CreateTournamentDialogProps,
  DraggableParticipant,
  Match,
  DIALOG_WIDTH,
  DIALOG_HEIGHT,
  GAMES_AREA_HEIGHT,
  BASE_BOX_WIDTH,
  BASE_BOX_HEIGHT,
  ROUND_HORIZONTAL_GAP,
  INITIAL_TOP_MARGIN,
  GuestUser,
} from "../../types";
import { useMatchHistory } from "../../hooks/useMatchHistory";
import { TournamentForm } from "./components/TournamentForm";
import { GuestDialog } from "./components/GuestDialog";
import { TournamentParticipants } from "./components/TournamentParticipants";
import { MatchBox } from "./components/MatchBox";

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
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [draggedParticipant, setDraggedParticipant] =
    useState<DraggableParticipant | null>(null);
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [newMatchPosition, setNewMatchPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newGuestUsername, setNewGuestUsername] = useState("");

  const {
    matches,
    setMatches,
    historyIndex,
    handleUndo,
    handleRedo,
    clearAllMatches,
    autoArrangeMatches,
    addToHistory,
    updateMatch,
  } = useMatchHistory();

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
            status: "PENDING",
            stats: {},
            isGuest: true,
          })),
        ],
        matches: formattedMatches,
      };

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
      onClose();
    }
  };

  const handleAddGuest = () => {
    if (newGuestUsername.trim()) {
      setGuestUsers([
        ...guestUsers,
        {
          id: `guest_${newGuestUsername.trim()}`,
          username: newGuestUsername.trim(),
        },
      ]);
      setNewGuestUsername("");
      setIsGuestDialogOpen(false);
    }
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuestUsers(
      guestUsers.filter((guest) => `guest_${guest.username}` !== guestId)
    );
  };

  const handleDragStart = (participant: DraggableParticipant) => {
    setDraggedParticipant(participant);
  };

  const handleDragEnd = () => {
    setDraggedParticipant(null);
  };

  const handleMatchDragStart = (e: React.DragEvent) => {
    const matchId = e.currentTarget.getAttribute("data-match-id");
    if (matchId) {
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        setDraggedMatch(match);
      }
    }
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

    const round = Math.floor(x / ROUND_HORIZONTAL_GAP) + 1;

    const updatedMatch = {
      ...draggedMatch,
      round: round,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y: y - INITIAL_TOP_MARGIN,
      },
    };

    const updatedMatches = matches.map((m) =>
      m.id === draggedMatch.id ? updatedMatch : m
    );

    addToHistory(updatedMatches);
    setMatches(updatedMatches);
  };

  const removeMatch = (matchId: string) => {
    const updatedMatches = matches.filter((match) => match.id !== matchId);
    addToHistory(updatedMatches);
    setMatches(updatedMatches);
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

    const round = Math.floor(x / ROUND_HORIZONTAL_GAP) + 1;

    const newMatch: Match = {
      id: uuidv4(),
      round: round,
      matchNumber: matches.filter((m) => m.round === round).length + 1,
      team1: null,
      team2: null,
      position: {
        x: (round - 1) * ROUND_HORIZONTAL_GAP,
        y: y - INITIAL_TOP_MARGIN,
      },
    };

    const updatedMatches = [...matches, newMatch];
    addToHistory(updatedMatches);
    setMatches(updatedMatches);
    setIsCreatingMatch(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreatingMatch) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNewMatchPosition({ x, y });
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
                      backgroundColor: "rgba(240, 6, 201, 0.08)",
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
                    disabled={historyIndex >= matches.length - 1}
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
            <TournamentForm
              newTournament={newTournament}
              onTournamentChange={onTournamentChange}
              errors={errors}
              isCreating={isCreating}
            />
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
                {isCreatingMatch && newMatchPosition && (
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
                    <Box sx={{ mt: 1 }}>TBD vs TBD</Box>
                  </Paper>
                )}

                {matches.map((match) => (
                  <Box
                    draggable
                    key={match.id}
                    onDragStart={() =>
                      handleDragStart(match.team1 || match.team2)
                    }
                    onDragEnd={handleDragEnd}
                  >
                    <MatchBox
                      match={match}
                      channelUsers={channelUsers}
                      onDragStart={handleMatchDragStart}
                      onDragEnd={handleMatchDragEnd}
                      onDelete={() => removeMatch(match.id)}
                      onUpdate={(updates) => updateMatch(match.id, updates)}
                      draggedParticipant={draggedParticipant}
                    />
                  </Box>
                ))}
              </Paper>

              <TournamentParticipants
                channelUsers={channelUsers}
                guestUsers={guestUsers}
                draggedParticipant={draggedParticipant}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onAddGuest={() => setIsGuestDialogOpen(true)}
                onRemoveGuest={handleRemoveGuest}
              />
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

      <GuestDialog
        open={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        onAdd={handleAddGuest}
      />
    </>
  );
};

export default CreateTournamentDialog;
