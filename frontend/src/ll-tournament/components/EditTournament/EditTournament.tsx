import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";
import { MatchBox } from "./MatchBox";
import { MatchConnectionManager } from "./MatchConnectionManager";
import { MatchConnections } from "./MatchConnections";
import { TournamentParticipants } from "./TournamentParticipants";
import { TournamentToolbar } from "./TournamentToolbar";
import {
  Match,
  DraggableParticipant,
  GuestUser,
  Tournament,
} from "../../types";

interface EditTournamentProps {
  tournament: Tournament;
  channelUsers: DraggableParticipant[];
  onClose: () => void;
  onSave: (tournament: Tournament) => void;
}

export const EditTournament: React.FC<EditTournamentProps> = ({
  tournament,
  channelUsers,
  onClose,
  onSave,
}) => {
  // State for matches
  const [matches, setMatches] = useState<Match[]>(tournament.matches || []);
  const [history, setHistory] = useState<Match[][]>([tournament.matches || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // State for participants
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [draggedParticipant, setDraggedParticipant] =
    useState<DraggableParticipant | null>(null);

  // State for connection mode
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [sourceMatch, setSourceMatch] = useState<Match | null>(null);

  // Container dimensions
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Container ref for dimensions
  const containerRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      setContainerDimensions({
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
    }
  }, []);

  // Handle match updates
  const handleMatchUpdate = (matchId: string, updates: Partial<Match>) => {
    const newMatches = matches.map((match) =>
      match.id === matchId ? { ...match, ...updates } : match
    );
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  // Handle match deletion
  const handleMatchDelete = (matchId: string) => {
    const newMatches = matches.filter((match) => match.id !== matchId);
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  // Add to history
  const addToHistory = (newMatches: Match[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMatches);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMatches(history[historyIndex - 1]);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMatches(history[historyIndex + 1]);
    }
  };

  // Handle auto-arrange
  const handleAutoArrange = () => {
    // Implement auto-arrange logic here
  };

  // Handle clear all
  const handleClearAll = () => {
    setMatches([]);
    addToHistory([]);
  };

  // Handle add match
  const handleAddMatch = () => {
    const newMatch: Match = {
      id: `match_${Date.now()}`,
      position: { x: 100, y: 100 },
      team1: null,
      team2: null,
      rounds: 3,
      teamType: "solo",
      round: 1,
      matchNumber: matches.length + 1,
    };
    const newMatches = [...matches, newMatch];
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  // Handle add team match
  const handleAddTeamMatch = () => {
    const newMatch: Match = {
      id: `match_${Date.now()}`,
      position: { x: 100, y: 100 },
      team1: {
        type: "team",
        id: "",
        isGuest: false,
        score: 0,
        players: [],
      },
      team2: {
        type: "team",
        id: "",
        isGuest: false,
        score: 0,
        players: [],
      },
      rounds: 3,
      teamType: "team",
      round: 1,
      matchNumber: matches.length + 1,
    };
    const newMatches = [...matches, newMatch];
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  // Handle guest user management
  const handleAddGuest = () => {
    const newGuest: GuestUser = {
      id: `guest_${Date.now()}`,
      username: `Guest ${guestUsers.length + 1}`,
    };
    setGuestUsers([...guestUsers, newGuest]);
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuestUsers(
      guestUsers.filter((guest) => `guest_${guest.username}` !== guestId)
    );
  };

  // Handle connection mode toggle
  const handleConnectionModeToggle = () => {
    setIsConnectionMode(!isConnectionMode);
    setSourceMatch(null);
  };

  // Handle match selection for connection
  const handleMatchSelect = (match: Match) => {
    if (!isConnectionMode) return;

    if (!sourceMatch) {
      setSourceMatch(match);
    } else if (sourceMatch.id !== match.id) {
      // Create connection between matches
      const updatedMatches = matches.map((m) => {
        if (m.id === sourceMatch.id) {
          return { ...m, nextMatchId: match.id };
        }
        return m;
      });
      setMatches(updatedMatches);
      addToHistory(updatedMatches);
      setSourceMatch(null);
    }
  };

  // Handle save
  const handleSave = () => {
    const updatedTournament: Tournament = {
      ...tournament,
      matches: matches.map((match) => ({
        ...match,
        position: match.position,
        nextMatchId: match.nextMatchId,
        team1: match.team1,
        team2: match.team2,
        rounds: match.rounds,
        teamType: match.teamType,
        round: match.round || 1,
        matchNumber: match.matchNumber || matches.indexOf(match) + 1,
      })),
    };
    onSave(updatedTournament);
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
          bgcolor: "#1a1a1a",
          color: "white",
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            bgcolor: "#1a1a1a",
            color: "white",
          }}
        >
          {/* Header with save button */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              bgcolor: "#23293a",
            }}
          >
            <Typography variant="h6" sx={{ color: "white" }}>
              Edit Tournament: {tournament.name}
            </Typography>
            <Box>
              <Button
                variant={isConnectionMode ? "contained" : "outlined"}
                color="primary"
                onClick={handleConnectionModeToggle}
                sx={{ mr: 1 }}
              >
                {isConnectionMode ? "Exit Connection Mode" : "Connect Matches"}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClose}
                sx={{ color: "white", borderColor: "white" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>

          {/* Main content */}
          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left sidebar with participants */}
            <Box
              sx={{
                width: 300,
                p: 2,
                borderRight: "1px solid rgba(255,255,255,0.1)",
                bgcolor: "#23293a",
                overflowY: "auto",
                flexShrink: 0,
                zIndex: 2,
                position: "relative",
              }}
            >
              <TournamentParticipants
                channelUsers={channelUsers}
                guestUsers={guestUsers}
                draggedParticipant={draggedParticipant}
                onDragStart={setDraggedParticipant}
                onDragEnd={() => setDraggedParticipant(null)}
                onAddGuest={handleAddGuest}
                onRemoveGuest={handleRemoveGuest}
              />
            </Box>

            {/* Main content area */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                bgcolor: "#1a1a1a",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Toolbar */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#23293a",
                  flexShrink: 0,
                  zIndex: 2,
                  position: "relative",
                }}
              >
                <TournamentToolbar
                  matchesCount={matches.length}
                  historyIndex={historyIndex}
                  onAddMatch={handleAddMatch}
                  onAddTeamMatch={handleAddTeamMatch}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onAutoArrange={handleAutoArrange}
                  onClearAll={handleClearAll}
                />
              </Box>

              {/* Tournament canvas */}
              <Box
                ref={containerRef}
                sx={{
                  flex: 1,
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: "#1a1a1a",
                  marginLeft: 0,
                  paddingLeft: 0,
                  zIndex: 1,
                }}
              >
                {/* Match boxes */}
                {matches.map((match) => (
                  <MatchBox
                    key={match.id}
                    match={match}
                    channelUsers={channelUsers}
                    draggedParticipant={draggedParticipant}
                    onDragStart={setDraggedParticipant}
                    onDragEnd={() => setDraggedParticipant(null)}
                    onDelete={() => handleMatchDelete(match.id)}
                    onUpdate={(updates) => handleMatchUpdate(match.id, updates)}
                    parentWidth={containerDimensions.width}
                    parentHeight={containerDimensions.height}
                    isSourceMatch={sourceMatch?.id === match.id}
                    onSelectAsSource={() => handleMatchSelect(match)}
                  />
                ))}

                {/* Match connections */}
                <MatchConnections matches={matches} />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditTournament;
