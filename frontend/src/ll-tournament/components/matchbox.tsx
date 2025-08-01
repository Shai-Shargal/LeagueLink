import React, { useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Autocomplete,
  Chip,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, Close, Settings, Save, Link } from "@mui/icons-material";
import api from "../../services/api";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string | null;
  isGuest?: boolean;
}

interface TeamSlotProps {
  id: string;
  teamColor: string;
  title: string;
  players: User[];
  onRemovePlayer: (id: string) => void;
}

const TeamSlot: React.FC<TeamSlotProps> = ({
  id,
  teamColor,
  players,
  onRemovePlayer,
  title,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 32,
        borderRadius: 1,
        border: "1px dashed #aaa",
        backgroundColor: isOver ? "#444" : teamColor,
        px: 0.75,
        py: 0.25,
        mb: 0.25,
      }}
    >
      <Typography fontSize={10} fontWeight={600} color="#fff" mb={0.25}>
        {title}
      </Typography>

      {players.length === 0 && (
        <Typography fontSize={9} fontStyle="italic" color="#ddd">
          TBD
        </Typography>
      )}

      {players.map((p) => (
        <Box
          key={p.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 0.5,
            px: 0.5,
            py: 0.25,
            mt: 0.25,
            color: "#fff",
            fontSize: 9,
          }}
        >
          <span>{p.name}</span>
          <IconButton
            size="small"
            onClick={() => onRemovePlayer(p.id)}
            sx={{ p: 0.25 }}
          >
            <Delete fontSize="small" sx={{ color: "#fff", fontSize: 12 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

interface GameScore {
  team1Score: number;
  team2Score: number;
}

interface MatchBoxProps {
  id?: string;
  onRemove?: () => void;
  position?: { x: number; y: number };
  tournamentUsers?: User[];
  onClick?: () => void;
  isSelected?: boolean;
  tournamentId?: string;
  round?: number;
  matchNumber?: number;
  isFetching?: boolean;
  initialData?: {
    team1: {
      players: Array<{
        userId: string;
        username: string;
        profilePicture?: string;
      }>;
      score: number;
    };
    team2: {
      players: Array<{
        userId: string;
        username: string;
        profilePicture?: string;
      }>;
      score: number;
    };
    bestOf: number;
    status: string;
    gameScores: Array<{
      team1Score: number;
      team2Score: number;
    }>;
    _id: string;
    stats?: Record<
      string,
      { value: number; playerId?: string; playerName?: string }
    >;
  };
}

const MatchBox: React.FC<MatchBoxProps> = ({
  id = "matchbox",
  onRemove,
  position = { x: 0, y: 0 },
  tournamentUsers = [],
  onClick,
  isSelected = false,
  tournamentId,
  round = 1,
  matchNumber = 1,
  isFetching = false,
  initialData,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      type: "matchbox",
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x + position.x}px, ${transform.y + position.y}px, 0)`,
      }
    : {
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      };

  const [team1, setTeam1] = useState<User[]>([]);
  const [team2, setTeam2] = useState<User[]>([]);
  const [bestOf, setBestOf] = useState<number>(3);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string>("pending");
  const [gameScores, setGameScores] = useState<GameScore[]>([
    { team1Score: 0, team2Score: 0 },
  ]);
  const [winner, setWinner] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [stats, setStats] = useState<
    Record<string, { value: number; playerId?: string; playerName?: string }>
  >({});
  const [newStatName, setNewStatName] = useState("");
  const [newStatValue, setNewStatValue] = useState("");
  const [newStatPlayerId, setNewStatPlayerId] = useState<string>("");

  // Initialize match data when component mounts or initialData changes
  React.useEffect(() => {
    if (initialData) {
      // Convert the initial data to match our component's state format
      const team1Players = initialData.team1.players.map((player) => ({
        id: player.userId,
        name: player.username,
        avatar: player.profilePicture || null,
      }));
      const team2Players = initialData.team2.players.map((player) => ({
        id: player.userId,
        name: player.username,
        avatar: player.profilePicture || null,
      }));

      setTeam1(team1Players);
      setTeam2(team2Players);
      setBestOf(initialData.bestOf);
      setMatchStatus(initialData.status.toLowerCase());
      setGameScores(initialData.gameScores);
      setMatchId(initialData._id);
      setIsSaved(true);
      // Convert old stats format to new format if needed
      const convertedStats: Record<
        string,
        { value: number; playerId?: string; playerName?: string }
      > = {};
      if (initialData.stats) {
        Object.entries(initialData.stats).forEach(([key, value]) => {
          if (typeof value === "number") {
            convertedStats[key] = { value };
          } else if (typeof value === "object" && value !== null) {
            convertedStats[key] = value as {
              value: number;
              playerId?: string;
              playerName?: string;
            };
          }
        });
      }
      setStats(convertedStats);

      // Calculate winner based on game scores
      const team1Wins = initialData.gameScores.filter(
        (game) => game.team1Score > game.team2Score
      ).length;
      const team2Wins = initialData.gameScores.filter(
        (game) => game.team2Score > game.team1Score
      ).length;

      if (team1Wins > initialData.bestOf / 2) {
        setWinner("team1");
      } else if (team2Wins > initialData.bestOf / 2) {
        setWinner("team2");
      } else {
        setWinner("");
      }
    }
  }, [initialData]);

  const isInAnyTeam = (id: string) =>
    team1.some((u) => u.id === id) || team2.some((u) => u.id === id);

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleBestOfChange = (newBestOf: number) => {
    setBestOf(newBestOf);
    // Adjust game scores array length
    const newGameScores = Array(newBestOf)
      .fill(null)
      .map((_, index) => gameScores[index] || { team1Score: 0, team2Score: 0 });
    setGameScores(newGameScores);
  };

  const handleGameScoreChange = (
    gameIndex: number,
    team: "team1" | "team2",
    value: number
  ) => {
    const newGameScores = [...gameScores];
    newGameScores[gameIndex] = {
      ...newGameScores[gameIndex],
      [`${team}Score`]: value,
    };
    setGameScores(newGameScores);

    // Calculate winner based on game scores
    const team1Wins = newGameScores.filter(
      (game) => game.team1Score > game.team2Score
    ).length;
    const team2Wins = newGameScores.filter(
      (game) => game.team2Score > game.team1Score
    ).length;

    if (team1Wins > bestOf / 2) {
      setWinner("team1");
    } else if (team2Wins > bestOf / 2) {
      setWinner("team2");
    } else {
      setWinner("");
    }
  };

  const handleTeamMemberChange = (
    team: "team1" | "team2",
    newMembers: User[]
  ) => {
    if (team === "team1") {
      setTeam1(newMembers);
    } else {
      setTeam2(newMembers);
    }
  };

  const isUserInAnyTeam = (userId: string) => {
    return (
      team1.some((p) => p.id === userId) || team2.some((p) => p.id === userId)
    );
  };

  const getAvailableUsers = (currentTeam: "team1" | "team2") => {
    return tournamentUsers.filter((user) => {
      const isInCurrentTeam =
        currentTeam === "team1"
          ? team1.some((p) => p.id === user.id)
          : team2.some((p) => p.id === user.id);
      const isInOtherTeam =
        currentTeam === "team1"
          ? team2.some((p) => p.id === user.id)
          : team1.some((p) => p.id === user.id);
      return isInCurrentTeam || !isInOtherTeam;
    });
  };

  const handleAddStat = () => {
    if (newStatName && newStatValue) {
      const selectedPlayer = [...team1, ...team2].find(
        (p) => p.id === newStatPlayerId
      );
      setStats((prev) => ({
        ...prev,
        [newStatName]: {
          value: Number(newStatValue),
          playerId: newStatPlayerId || undefined,
          playerName: selectedPlayer?.name || undefined,
        },
      }));
      setNewStatName("");
      setNewStatValue("");
      setNewStatPlayerId("");
    }
  };

  const handleRemoveStat = (statName: string) => {
    setStats((prev) => {
      const newStats = { ...prev };
      delete newStats[statName];
      return newStats;
    });
  };

  const handleSave = async () => {
    if (!tournamentId) {
      setSaveError("Tournament ID is required");
      return;
    }

    try {
      const matchData = {
        tournamentId,
        team1: {
          players: team1.map((player) => ({
            userId: player.id,
            username: player.name,
            profilePicture: player.avatar,
          })),
          score: gameScores.reduce((sum, game) => sum + game.team1Score, 0),
        },
        team2: {
          players: team2.map((player) => ({
            userId: player.id,
            username: player.name,
            profilePicture: player.avatar,
          })),
          score: gameScores.reduce((sum, game) => sum + game.team2Score, 0),
        },
        bestOf,
        position,
        round,
        matchNumber,
        status: matchStatus.toUpperCase(),
        gameScores,
        stats,
        winner: winner
          ? winner === "team1"
            ? team1[0]?.id
            : team2[0]?.id
          : undefined,
      };

      if (matchId) {
        // Update existing match
        await api.put(`/matches/${matchId}`, matchData);
      } else {
        // Create new match
        const response = await api.post(
          `/tournaments/${tournamentId}/matches`,
          matchData
        );
        setMatchId(response.data.data._id);
      }

      setSaveSuccess(true);
      setIsSaved(true);
      setIsSettingsOpen(false);
    } catch (error: any) {
      setSaveError(error.response?.data?.message || "Error saving match");
    }
  };

  const handleDelete = async () => {
    if (!isSaved || !matchId) {
      setDeleteError(
        "You can only delete saved matches. Use the X button to remove unsaved matches."
      );
      return;
    }

    try {
      const response = await api.delete(`/matches/${matchId}`);

      if (response.data.success) {
        onRemove?.();
      } else {
        setDeleteError(response.data.message || "Failed to delete match");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setDeleteError("Invalid match ID. Please try saving the match again.");
      } else if (error.response?.status === 404) {
        setDeleteError("Match not found. It may have been already deleted.");
      } else {
        setDeleteError(
          error.response?.data?.message || "Failed to delete match"
        );
      }
    }
  };

  const handleRemove = () => {
    if (isSaved) {
      setDeleteError(
        "Please use the delete button in settings to delete saved matches."
      );
      return;
    }
    onRemove?.();
  };

  return (
    <>
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        id={id}
        data-match-id={id}
        data-testid={`matchbox-${id}`}
        sx={{
          backgroundColor: "#1a1a2e",
          p: 0.75,
          borderRadius: 1,
          width: 140,
          position: "absolute",
          cursor: "grab",
          border: isSelected ? "2px solid #2196f3" : "none",
          boxShadow: isSelected ? "0 0 10px rgba(33, 150, 243, 0.5)" : "none",
          zIndex: 1,
          pointerEvents: "auto",
          ...style,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -6,
            right: -6,
            display: "flex",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            sx={{
              backgroundColor: "#4caf50",
              color: "#fff",
              width: 16,
              height: 16,
              minWidth: 16,
              "&:hover": {
                backgroundColor: "#388e3c",
              },
              "& .MuiSvgIcon-root": {
                fontSize: 12,
              },
            }}
          >
            <Link />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsSettingsOpen(true)}
            sx={{
              backgroundColor: "#2196f3",
              color: "#fff",
              width: 16,
              height: 16,
              minWidth: 16,
              "&:hover": {
                backgroundColor: "#1976d2",
              },
              "& .MuiSvgIcon-root": {
                fontSize: 12,
              },
            }}
          >
            <Settings />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleRemove}
            disabled={isSaved || isFetching}
            sx={{
              backgroundColor: "#ff4444",
              color: "#fff",
              width: 16,
              height: 16,
              minWidth: 16,
              "&:hover": {
                backgroundColor: "#cc0000",
              },
              "& .MuiSvgIcon-root": {
                fontSize: 12,
              },
              opacity: isSaved || isFetching ? 0.5 : 1,
              cursor: isSaved || isFetching ? "not-allowed" : "pointer",
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <TeamSlot
          id="team1"
          teamColor={winner === "team1" ? "#4caf50" : "#3f51b5"}
          title="Team 1"
          players={team1}
          onRemovePlayer={(id) =>
            setTeam1((prev) => prev.filter((u) => u.id !== id))
          }
        />

        <Typography
          sx={{
            textAlign: "center",
            color: "#aaa",
            fontSize: 10,
            my: 0.25,
            fontWeight: 500,
          }}
        >
          VS
        </Typography>

        <TeamSlot
          id="team2"
          teamColor={winner === "team2" ? "#4caf50" : "#d81b60"}
          title="Team 2"
          players={team2}
          onRemovePlayer={(id) =>
            setTeam2((prev) => prev.filter((u) => u.id !== id))
          }
        />
      </Box>

      <Dialog
        open={isSettingsOpen}
        onClose={handleSettingsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(26, 26, 46, 0.95)",
            color: "#fff",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            "& .MuiDialogTitle-root": {
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              padding: "20px 24px",
              fontSize: "1.5rem",
              fontWeight: 600,
              background:
                "linear-gradient(45deg, rgba(33,150,243,0.1), rgba(33,150,243,0))",
            },
            "& .MuiDialogContent-root": {
              padding: "24px",
            },
            "& .MuiDialogActions-root": {
              padding: "16px 24px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255,255,255,0.05)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255,255,255,0.7)",
            },
            "& .MuiSelect-select": {
              color: "#fff",
            },
            "& .MuiChip-root": {
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            },
            "& .MuiButton-root": {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              "&.MuiButton-contained": {
                boxShadow: "0 2px 4px rgba(33,150,243,0.3)",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(33,150,243,0.4)",
                },
              },
            },
          },
        }}
      >
        <DialogTitle>Match Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Match Status</InputLabel>
              <Select
                value={matchStatus}
                onChange={(e) => setMatchStatus(e.target.value)}
                label="Match Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#3f51b5" }}
                >
                  Team 1
                </Typography>
                <Autocomplete
                  multiple
                  options={getAvailableUsers("team1")}
                  value={team1}
                  onChange={(_, newValue) =>
                    handleTeamMemberChange("team1", newValue)
                  }
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      placeholder="Select players"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
                        avatar={
                          <Avatar src={option.avatar || undefined}>
                            {option.name.charAt(0)}
                          </Avatar>
                        }
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#d81b60" }}
                >
                  Team 2
                </Typography>
                <Autocomplete
                  multiple
                  options={getAvailableUsers("team2")}
                  value={team2}
                  onChange={(_, newValue) =>
                    handleTeamMemberChange("team2", newValue)
                  }
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      placeholder="Select players"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
                        avatar={
                          <Avatar src={option.avatar || undefined}>
                            {option.name.charAt(0)}
                          </Avatar>
                        }
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Box>

              <TextField
                label="Best of"
                type="number"
                value={bestOf}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  // Only allow odd numbers between 1 and 9
                  if (value >= 1 && value <= 9 && value % 2 === 1) {
                    handleBestOfChange(value);
                  }
                }}
                inputProps={{
                  min: 1,
                  max: 9,
                  step: 2, // This will make the number input increment by 2
                }}
                size="small"
                fullWidth
                helperText="Must be an odd number (1, 3, 5, 7, 9)"
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Game Scores
              </Typography>
              <Grid container spacing={1}>
                {gameScores.map((game, index) => (
                  <Grid item xs={12} key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Game {index + 1}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#3f51b5", fontWeight: 500 }}
                          >
                            {team1.length > 0
                              ? team1.map((p) => p.name).join(", ")
                              : "Team 1"}
                          </Typography>
                          <TextField
                            type="number"
                            value={game.team1Score}
                            onChange={(e) =>
                              handleGameScoreChange(
                                index,
                                "team1",
                                Number(e.target.value)
                              )
                            }
                            size="small"
                            fullWidth
                            sx={{
                              mt: 0.5,
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(63, 81, 181, 0.1)",
                              },
                            }}
                          />
                        </Box>
                        <Typography sx={{ px: 1 }}>vs</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#d81b60", fontWeight: 500 }}
                          >
                            {team2.length > 0
                              ? team2.map((p) => p.name).join(", ")
                              : "Team 2"}
                          </Typography>
                          <TextField
                            type="number"
                            value={game.team2Score}
                            onChange={(e) =>
                              handleGameScoreChange(
                                index,
                                "team2",
                                Number(e.target.value)
                              )
                            }
                            size="small"
                            fullWidth
                            sx={{
                              mt: 0.5,
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(216, 27, 96, 0.1)",
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Stats Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stats
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(stats).map(([name, statData]) => (
                  <Grid item xs={12} sm={6} key={name}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography>
                        {name}: {statData.value}
                        {statData.playerName && ` (${statData.playerName})`}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveStat(name)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <TextField
                  label="Stat Name"
                  value={newStatName}
                  onChange={(e) => setNewStatName(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Value"
                  type="number"
                  value={newStatValue}
                  onChange={(e) => setNewStatValue(e.target.value)}
                  size="small"
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Player (Optional)</InputLabel>
                  <Select
                    value={newStatPlayerId}
                    onChange={(e) => setNewStatPlayerId(e.target.value)}
                    label="Player (Optional)"
                  >
                    <MenuItem value="">
                      <em>No specific player</em>
                    </MenuItem>
                    {[...team1, ...team2].map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleAddStat}
                  disabled={!newStatName || !newStatValue}
                >
                  Add Stat
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          {isSaved && (
            <Button onClick={handleDelete} color="error" startIcon={<Delete />}>
              Delete Match
            </Button>
          )}
          <Button onClick={handleSettingsClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
      >
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!deleteError}
        autoHideDuration={6000}
        onClose={() => setDeleteError(null)}
      >
        <Alert severity="error" onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSaveSuccess(false)}>
          Match saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default MatchBox;
