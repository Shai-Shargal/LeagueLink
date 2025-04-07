import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  EmojiEvents as TournamentIcon,
  BarChart as StatsIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Tournament,
  ChannelUserStats,
  TournamentStatsConfig,
  ParticipantStatus,
  TournamentStatus,
} from "./types";
import { tournamentService } from "./services/tournamentService";
import { authService } from "../services/api";

interface TournamentViewProps {
  onBack: () => void;
  channelId: string;
  isAdmin: boolean;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
}

const defaultStatsConfig: TournamentStatsConfig = {
  enabledStats: ["wins", "losses", "winRate"],
  customStats: [],
};

const SPORTS_EMOJIS: { emoji: string; name: string }[] = [
  { emoji: "⚽", name: "Soccer" },
  { emoji: "🏀", name: "Basketball" },
  { emoji: "🏈", name: "Football" },
  { emoji: "⚾", name: "Baseball" },
  { emoji: "🏒", name: "Hockey" },
  { emoji: "🎾", name: "Tennis" },
  { emoji: "🏐", name: "Volleyball" },
  { emoji: "🏓", name: "Table Tennis" },
  { emoji: "🏸", name: "Badminton" },
  { emoji: "🏊", name: "Swimming" },
  { emoji: "🏃", name: "Running" },
  { emoji: "🚴", name: "Cycling" },
  { emoji: "🏋️", name: "Weightlifting" },
  { emoji: "🥊", name: "Boxing" },
  { emoji: "🥋", name: "Martial Arts" },
];

interface UserProfileData {
  username: string;
  bio: string;
  favoriteSports: string[];
  profilePicture?: string;
}

const TournamentView: React.FC<TournamentViewProps> = ({
  onBack,
  channelId,
  isAdmin,
  channelUsers,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statsConfigDialogOpen, setStatsConfigDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [userStats, setUserStats] = useState<ChannelUserStats[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTournament, setNewTournament] = useState<Partial<Tournament>>({
    name: "",
    date: "",
    time: "",
    location: "",
    statsConfig: defaultStatsConfig,
  });
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(
    null
  );
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, [channelId]);

  const loadData = async () => {
    try {
      const [stats, tournaments] = await Promise.all([
        tournamentService.getChannelUserStats(channelId),
        tournamentService.getChannelTournaments(channelId),
      ]);

      // Initialize stats for all channel users if they don't have stats yet
      const initializedStats = channelUsers.map((user) => {
        const existingStats = (stats as ChannelUserStats[] | undefined)?.find(
          (stat: ChannelUserStats) => stat.userId === user.id
        );
        return (
          existingStats || {
            userId: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
            totalTournaments: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            customStats: {},
          }
        );
      });

      setUserStats(initializedStats);
      setTournaments(tournaments || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      // Initialize stats for all users even if the API call fails
      const defaultStats = channelUsers.map((user) => ({
        userId: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        totalTournaments: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        customStats: {},
      }));
      setUserStats(defaultStats);
    }
  };

  const handleCreateTournament = async () => {
    setIsCreating(true);
    try {
      // Create initial participants array with all channel users
      const initialParticipants = channelUsers.map((user) => ({
        userId: user.id,
        username: user.username,
        status: ParticipantStatus.PENDING,
        stats: {
          wins: 0,
          losses: 0,
          winRate: 0,
        },
      }));

      // Create the tournament with all channel users as participants
      const tournamentData = {
        ...newTournament,
        participants: initialParticipants,
        status: TournamentStatus.UPCOMING,
      };

      await tournamentService.createTournament(channelId, tournamentData);
      setCreateDialogOpen(false);
      setNewTournament({
        name: "",
        date: "",
        time: "",
        location: "",
        statsConfig: defaultStatsConfig,
      });
      loadData();
    } catch (error) {
      console.error("Failed to create tournament:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatsConfig = async (
    tournamentId: string,
    config: TournamentStatsConfig
  ) => {
    try {
      await tournamentService.updateTournamentStatsConfig(tournamentId, config);
      setStatsConfigDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to update stats config:", error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      // First find the user's username from channelUsers
      const user = channelUsers.find((user) => user.id === userId);
      if (!user) {
        console.error("User not found in channel users");
        return;
      }

      console.log("Fetching profile for user:", user.username);
      const response = await authService.getUserProfile(user.username);

      console.log("Profile data received:", response);
      if (response.success) {
        setSelectedUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    await fetchUserProfile(userId);
    setUserProfileOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: 3,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Statistics" icon={<StatsIcon />} iconPosition="start" />
            <Tab
              label="Tournaments"
              icon={<TournamentIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <TableContainer
            component={Paper}
            sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white", width: "40%" }}>
                    Player
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    Total Tournaments
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    Wins
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    Losses
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    Win Rate
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userStats.map((player) => (
                  <TableRow key={player.userId}>
                    <TableCell
                      sx={{
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                      }}
                    >
                      <Avatar
                        src={player.profilePicture}
                        alt={player.username}
                        onClick={() => handleUserClick(player.userId)}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "rgba(198, 128, 227, 0.2)",
                          color: "white",
                          fontSize: "1rem",
                          border: "2px solid rgba(198, 128, 227, 0.3)",
                          boxShadow: "0 0 10px rgba(198, 128, 227, 0.1)",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: "0 0 15px rgba(198, 128, 227, 0.3)",
                            border: "2px solid rgba(198, 128, 227, 0.6)",
                          },
                        }}
                      >
                        {player.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontWeight: 500 }}>
                        {player.username}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {player.totalTournaments}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {player.wins}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {player.losses}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {player.winRate}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <Box>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ mb: 3 }}
              >
                Create Tournament
              </Button>
            )}

            <Stack spacing={2}>
              {tournaments.map((tournament) => (
                <Paper
                  key={tournament.id}
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">{tournament.name}</Typography>
                    {isAdmin && (
                      <Tooltip title="Configure Statistics">
                        <IconButton
                          onClick={() => {
                            setSelectedTournament(tournament);
                            setStatsConfigDialogOpen(true);
                          }}
                          sx={{ color: "white" }}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon />
                      <Typography>{tournament.date}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TimeIcon />
                      <Typography>{tournament.time}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon />
                      <Typography>{tournament.location}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Enabled Statistics:
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}
                    >
                      {tournament.statsConfig.enabledStats.map((stat) => (
                        <Chip
                          key={stat}
                          label={stat}
                          size="small"
                          sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={onBack}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            backgroundColor: "rgba(198, 128, 227, 0.2)",
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(198, 128, 227, 0.3)",
            },
          }}
        >
          Back to Channel
        </Button>
      </Box>

      {/* Tournament Creation Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !isCreating && setCreateDialogOpen(false)}
      >
        <DialogTitle>Create New Tournament</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: 300 }}>
            <TextField
              label="Tournament Name"
              value={newTournament.name}
              onChange={(e) =>
                setNewTournament({ ...newTournament, name: e.target.value })
              }
              fullWidth
              disabled={isCreating}
            />
            <TextField
              label="Date"
              type="date"
              value={newTournament.date}
              onChange={(e) =>
                setNewTournament({ ...newTournament, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={isCreating}
            />
            <TextField
              label="Time"
              type="time"
              value={newTournament.time}
              onChange={(e) =>
                setNewTournament({ ...newTournament, time: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={isCreating}
            />
            <TextField
              label="Location"
              value={newTournament.location}
              onChange={(e) =>
                setNewTournament({ ...newTournament, location: e.target.value })
              }
              fullWidth
              disabled={isCreating}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Participants ({channelUsers.length} users will be automatically
                added)
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                {channelUsers.map((user) => (
                  <Chip
                    key={user.id}
                    label={user.username}
                    sx={{ m: 0.5 }}
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTournament}
            variant="contained"
            color="primary"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            {isCreating ? "Creating..." : "Create Tournament"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Configuration Dialog */}
      <Dialog
        open={statsConfigDialogOpen}
        onClose={() => setStatsConfigDialogOpen(false)}
      >
        <DialogTitle>Configure Tournament Statistics</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 300 }}>
            <Typography variant="subtitle1">Default Statistics</Typography>
            {["wins", "losses", "winRate"].map((stat) => (
              <FormControlLabel
                key={stat}
                control={
                  <Checkbox
                    checked={selectedTournament?.statsConfig.enabledStats.includes(
                      stat
                    )}
                    onChange={(e) => {
                      if (selectedTournament) {
                        const newConfig = {
                          ...selectedTournament.statsConfig,
                          enabledStats: e.target.checked
                            ? [
                                ...selectedTournament.statsConfig.enabledStats,
                                stat,
                              ]
                            : selectedTournament.statsConfig.enabledStats.filter(
                                (s) => s !== stat
                              ),
                        };
                        handleUpdateStatsConfig(
                          selectedTournament.id,
                          newConfig
                        );
                      }
                    }}
                  />
                }
                label={stat}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsConfigDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add the User Profile Dialog */}
      <Dialog
        open={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            color: "white",
            minWidth: 300,
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{ borderBottom: "1px solid rgba(198, 128, 227, 0.2)" }}
        >
          {loadingProfile ? (
            <CircularProgress size={20} sx={{ color: "#C680E3" }} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={selectedUser?.profilePicture}
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "rgba(198, 128, 227, 0.2)",
                  border: "2px solid rgba(198, 128, 227, 0.3)",
                }}
              >
                {selectedUser?.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{selectedUser?.username}</Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {loadingProfile ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress sx={{ color: "#C680E3" }} />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                >
                  Bio
                </Typography>
                <Typography>
                  {selectedUser?.bio || "No bio available"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                >
                  Favorite Sports
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedUser?.favoriteSports?.map((sport) => {
                    const sportInfo = SPORTS_EMOJIS.find(
                      (s) => s.emoji === sport
                    );
                    return sportInfo ? (
                      <Tooltip key={sport} title={sportInfo.name} arrow>
                        <Chip
                          label={`${sport} ${sportInfo.name}`}
                          sx={{
                            backgroundColor: "rgba(198, 128, 227, 0.2)",
                            color: "#C680E3",
                            border: "1px solid rgba(198, 128, 227, 0.3)",
                          }}
                        />
                      </Tooltip>
                    ) : null;
                  })}
                  {(!selectedUser?.favoriteSports ||
                    selectedUser.favoriteSports.length === 0) && (
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      No favorite sports added
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid rgba(198, 128, 227, 0.2)" }}>
          <Button
            onClick={() => setUserProfileOpen(false)}
            sx={{
              color: "#C680E3",
              "&:hover": {
                backgroundColor: "rgba(198, 128, 227, 0.1)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentView;
