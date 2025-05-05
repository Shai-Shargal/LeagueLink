import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import TournamentForm from "./components/TournamentForm";
import { TournamentHeader } from "./components/TournamentHeader";
import { TournamentBracket } from "./components/TournamentBracket";
import { TournamentParticipants } from "./components/TournamentParticipants";
import { GuestDialog } from "./components/GuestDialog";
import { Match, DraggableParticipant, GuestUser } from "./types";
import { useMatchHistory } from "./hooks/useMatchHistory";

interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournament: any) => void;
  newTournament: any;
  onTournamentChange: (updates: any) => void;
  channelUsers: DraggableParticipant[];
  isCreating: boolean;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 800;
const SIDEBAR_WIDTH = 300;

export const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
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
  const [isCreatingMatch] = useState(false);
  const [newMatchPosition, setNewMatchPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    matches,
    historyIndex,
    matchHistory,
    addMatch,
    updateMatch,
    deleteMatch,
    undo,
    redo,
    clearAll,
  } = useMatchHistory();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newTournament.name?.trim()) {
      newErrors.name = "Tournament name is required";
    }

    if (!newTournament.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!newTournament.date) {
      newErrors.date = "Date is required";
    }

    if (!newTournament.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...newTournament,
        matches,
      });
    }
  };

  const handleAddGuest = (guest: GuestUser) => {
    setGuestUsers([...guestUsers, guest]);
  };

  const handleRemoveGuest = (index: number) => {
    setGuestUsers(guestUsers.filter((_, i) => i !== index));
  };

  const handleMatchDragStart = (matchId: string, e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", matchId);
  };

  const handleMatchDragEnd = () => {
    setNewMatchPosition(null);
  };

  const handleMatchDrop = (matchId: string, e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateMatch(matchId, {
      position: { x, y },
    });
  };

  const handleMatchDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAutoArrange = () => {
    const matchesPerRow = 3;
    const matchWidth = 220;
    const matchHeight = 120;
    const horizontalGap = 50;
    const verticalGap = 50;

    const newMatches = matches.map((match, index) => {
      const row = Math.floor(index / matchesPerRow);
      const col = index % matchesPerRow;
      return {
        ...match,
        position: {
          x: col * (matchWidth + horizontalGap),
          y: row * (matchHeight + verticalGap),
        },
      };
    });

    clearAll();
    newMatches.forEach((match) => addMatch(match));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: DIALOG_WIDTH,
          height: DIALOG_HEIGHT,
          maxWidth: "none",
          maxHeight: "none",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create Tournament</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: SIDEBAR_WIDTH,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TournamentForm
                newTournament={newTournament}
                onTournamentChange={onTournamentChange}
                errors={errors}
                isCreating={isCreating}
              />

              <TournamentParticipants
                channelUsers={channelUsers}
                guestUsers={guestUsers}
                draggedParticipant={draggedParticipant}
                onDragStart={setDraggedParticipant}
                onDragEnd={() => setDraggedParticipant(null)}
                onAddGuest={() => setIsGuestDialogOpen(true)}
                onRemoveGuest={handleRemoveGuest}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TournamentHeader
                matches={matches}
                historyIndex={historyIndex}
                matchHistory={matchHistory}
                onAddMatch={() => {
                  const newMatch: Match = {
                    id: `match-${Date.now()}`,
                    position: { x: 0, y: 0 },
                    team1: null,
                    team2: null,
                  };
                  addMatch(newMatch);
                }}
                onUndo={undo}
                onRedo={redo}
                onAutoArrange={handleAutoArrange}
                onClearAll={clearAll}
              />

              <TournamentBracket
                matches={matches}
                channelUsers={channelUsers}
                draggedParticipant={draggedParticipant}
                isCreatingMatch={isCreatingMatch}
                newMatchPosition={newMatchPosition}
                onMatchDragStart={handleMatchDragStart}
                onMatchDragEnd={handleMatchDragEnd}
                onMatchDrop={handleMatchDrop}
                onMatchDragOver={handleMatchDragOver}
                onMatchDelete={deleteMatch}
                onMatchUpdate={updateMatch}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isCreating}>
            Create Tournament
          </Button>
        </DialogActions>
      </form>

      <GuestDialog
        open={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        onAdd={handleAddGuest}
      />
    </Dialog>
  );
};
