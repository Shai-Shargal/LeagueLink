import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  CircularProgress,
  Paper,
  Alert,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import {
  CreateTournamentDialogProps,
  DraggableParticipant,
  Match,
  GAMES_AREA_HEIGHT,
  BASE_BOX_WIDTH,
  BASE_BOX_HEIGHT,
  ROUND_HORIZONTAL_GAP,
  INITIAL_TOP_MARGIN,
  GuestUser,
} from "../../types";
import { useMatchHistory } from "../../hooks/useMatchHistory";
import { TournamentForm } from "./TournamentForm";
import { GuestDialog } from "./GuestDialog";
import { TournamentParticipants } from "./TournamentParticipants";
import { MatchBox } from "./MatchBox";
import { TournamentToolbar } from "./TournamentToolbar";
import { MatchConnections } from "./MatchConnections";

interface MatchUpdate {
  id: string;
  round?: number;
  matchNumber?: number;
  team1?: DraggableParticipant | null;
  team2?: DraggableParticipant | null;
  position?: { x: number; y: number };
  score1?: number;
  score2?: number;
  winner?: DraggableParticipant | null;
  nextMatchId?: string;
}

const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  newTournament,
  onTournamentChange,
  channelUsers,
  isCreating,
}: CreateTournamentDialogProps) => {
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
  const [paperSize, setPaperSize] = useState({ width: 1200, height: 700 });
  const paperRef = useRef<HTMLDivElement>(null);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);

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

  useEffect(() => {
    if (paperRef.current) {
      setPaperSize({
        width: paperRef.current.offsetWidth,
        height: paperRef.current.offsetHeight,
      });
    }
  }, [open, matches.length]);

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
      const [year, month, day] = newTournament.date?.split("-") || [];
      const [hours, minutes] = newTournament.time?.split(":") || [];
      const formattedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const formattedMatches = matches.map((match: Match) => ({
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
          ...guestUsers.map((guest: GuestUser) => ({
            id: `guest_${guest.username}`,
            userId: `guest_${guest.username}`,
            username: guest.username,
            status: "PENDING",
            stats: {},
            isGuest: true,
          })),
        ],
        matches: formattedMatches,
        matchConfig: {
          rounds: newTournament.rounds || 5,
        },
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
      guestUsers.filter(
        (guest: GuestUser) => `guest_${guest.username}` !== guestId
      )
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
      const match = matches.find((m: Match) => m.id === matchId);
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

    const updatedMatches = matches.map((m: Match) =>
      m.id === draggedMatch.id ? updatedMatch : m
    );

    addToHistory(updatedMatches);
    setMatches(updatedMatches);
  };

  const removeMatch = (matchId: string) => {
    const updatedMatches = matches.filter(
      (match: Match) => match.id !== matchId
    );
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
      matchNumber: matches.filter((m: Match) => m.round === round).length + 1,
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

  const handleSelectMatchAsSource = (matchId: string) => {
    if (connectionSource === matchId) {
      setConnectionSource(null);
    } else if (connectionSource) {
      const sourceMatch = matches.find((m: Match) => m.id === connectionSource);
      const targetMatch = matches.find((m: Match) => m.id === matchId);

      if (sourceMatch && targetMatch) {
        if (sourceMatch.round >= targetMatch.round) {
          console.error(
            "Cannot connect: Source round must be before target round"
          );
          setConnectionSource(null);
          return;
        }

        const updatedMatches = matches.map((match: Match) => {
          if (match.id === connectionSource) {
            return { ...match, nextMatchId: matchId };
          }
          return match;
        });

        addToHistory(updatedMatches);
        setMatches(updatedMatches);
      }

      setConnectionSource(null);
    } else {
      setConnectionSource(matchId);
    }
  };

  const clearConnectionMode = () => {
    setConnectionSource(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        PaperProps={{
          sx: {
            background: (theme) => theme.palette.background.default,
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            "&.MuiDialogTitle-root": {
              fontSize: "1.25rem",
              padding: "16px",
              minHeight: "auto",
            },
            fontWeight: 600,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: (theme) => theme.palette.background.paper,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EmojiEventsIcon
              sx={{
                color: "primary.main",
                fontSize: "1.75rem",
              }}
            />
            <Box
              component="div"
              sx={{
                typography: "h6",
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "0.5px",
              }}
            >
              Create New Tournament
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TournamentToolbar
              matchesCount={matches.length}
              historyIndex={historyIndex}
              onAddMatch={handleAddMatchClick}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onAutoArrange={autoArrangeMatches}
              onClearAll={clearAllMatches}
            />
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              sx={{
                color: "white",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            overflowY: "auto",
            background: (theme) => theme.palette.background.default,
            "&.MuiDialogContent-root": {
              paddingTop: "16px",
            },
            color: "white",
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
                ref={paperRef}
                sx={{
                  flex: 10,
                  minWidth: 0,
                  height: 700,
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
                <MatchConnections matches={matches} />
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

                {matches.map((match: Match) => (
                  <Box
                    key={match.id}
                    id={`match-${match.id}`}
                    data-match-id={match.id}
                    draggable
                    onDragStart={handleMatchDragStart}
                    onDragEnd={handleMatchDragEnd}
                  >
                    <MatchBox
                      match={match}
                      channelUsers={channelUsers}
                      draggedParticipant={draggedParticipant}
                      onDragStart={(e: React.DragEvent) => {
                        const team = match.team1 || match.team2;
                        if (team) handleDragStart(team);
                      }}
                      onDragEnd={handleDragEnd}
                      onDelete={() => removeMatch(match.id)}
                      onUpdate={(updates: MatchUpdate) =>
                        updateMatch(match.id, updates)
                      }
                      parentWidth={paperSize.width}
                      parentHeight={paperSize.height}
                      isSourceMatch={connectionSource === match.id}
                      onSelectAsSource={() =>
                        handleSelectMatchAsSource(match.id)
                      }
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
            color: "white",
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isCreating}
            sx={{ color: "white" }}
          >
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
              background: "linear-gradient(45deg,rgb(48, 11, 65), #9333EA)",
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
