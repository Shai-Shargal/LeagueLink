import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import {
  EmojiEvents as TournamentIcon,
  BarChart as StatsIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
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
import TournamentStatsTable from "./components/TournamentStatsTable";
import TournamentList from "./components/TournamentList";
import CreateTournamentDialog from "./components/CreateTournamentDialog";
import StatsConfigDialog from "./components/StatsConfigDialog";
import UserProfileDialog from "./components/UserProfileDialog";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentDetailsOpen, setTournamentDetailsOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<
    Partial<Tournament>
  >({});
  const [tournamentToDelete, setTournamentToDelete] =
    useState<Tournament | null>(null);

  useEffect(() => {
    loadData();
  }, [channelId]);

  const loadData = async () => {
    try {
      const [stats, tournaments] = await Promise.all([
        tournamentService.getChannelUserStats(channelId),
        tournamentService.getChannelTournaments(channelId),
      ]);

      const initializedStats = channelUsers.map((user) => {
        const existingStats = stats.find(
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
      setTournaments(tournaments);
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
      setTournaments([]);
    }
  };

  const handleCreateTournament = async () => {
    setIsCreating(true);
    try {
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

      const tournamentData = {
        name: newTournament.name,
        date: newTournament.date,
        time: newTournament.time,
        location: newTournament.location,
        participants: initialParticipants,
        status: TournamentStatus.UPCOMING,
        statsConfig: newTournament.statsConfig,
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

  const handleCloseCreateDialog = () => {
    if (!isCreating) {
      setCreateDialogOpen(false);
      setNewTournament({
        name: "",
        date: "",
        time: "",
        location: "",
        statsConfig: defaultStatsConfig,
      });
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

  const handleEditTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setEditingTournament({
      name: tournament.name,
      date: tournament.date,
      time: tournament.time,
      location: tournament.location,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteTournament = (tournament: Tournament) => {
    console.log("Deleting tournament:", tournament);
    if (!tournament.id) {
      console.error("Cannot delete tournament: No ID provided");
      return;
    }
    setTournamentToDelete(tournament);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log("Confirming delete for tournament:", tournamentToDelete);
    if (!tournamentToDelete?.id) {
      console.error("Cannot delete tournament: No ID provided");
      return;
    }
    try {
      const response = await tournamentService.deleteTournament(
        tournamentToDelete.id
      );
      console.log("Delete response:", response);
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
      await loadData(); // Wait for data to reload
    } catch (error) {
      console.error("Failed to delete tournament:", error);
    }
  };

  const handleTournamentClick = (tournament: Tournament) => {
    console.log("Tournament clicked:", tournament);
    setSelectedTournament(tournament);
    setTournamentDetailsOpen(true);
  };

  const handleUpdateTournament = async () => {
    if (!selectedTournament) return;
    try {
      await tournamentService.updateTournament(
        selectedTournament.id,
        editingTournament
      );
      setEditDialogOpen(false);
      setSelectedTournament(null);
      setEditingTournament({});
      loadData();
    } catch (error) {
      console.error("Failed to update tournament:", error);
    }
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
          <TournamentStatsTable
            userStats={userStats}
            onUserClick={handleUserClick}
          />
        )}

        {activeTab === 1 && (
          <Box>
            <TournamentList
              tournaments={tournaments}
              isAdmin={isAdmin}
              onTournamentClick={handleTournamentClick}
              onEditTournament={handleEditTournament}
              onDeleteTournament={handleDeleteTournament}
            />
          </Box>
        )}

        {/* Floating Create Tournament Button at bottom right */}
        {activeTab === 1 && isAdmin && (
          <Box sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 1200 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: "linear-gradient(45deg, #C680E3, #9333EA)",
                color: "#fff",
                fontWeight: 600,
                boxShadow: 6,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                minWidth: 0,
                minHeight: 0,
                "&:hover": {
                  background: "linear-gradient(45deg, #9333EA, #7928CA)",
                },
              }}
            >
              Create Tournament
            </Button>
          </Box>
        )}
      </Box>

      <CreateTournamentDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateTournament}
        newTournament={newTournament}
        onTournamentChange={(field: keyof Tournament, value: string) =>
          setNewTournament({ ...newTournament, [field]: value })
        }
        channelUsers={channelUsers}
        isCreating={isCreating}
      />

      <StatsConfigDialog
        open={statsConfigDialogOpen}
        onClose={() => setStatsConfigDialogOpen(false)}
        tournament={selectedTournament}
        onUpdateConfig={handleUpdateStatsConfig}
      />

      <UserProfileDialog
        open={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
        user={selectedUser}
        loading={loadingProfile}
      />

      {/* Tournament Details Dialog */}
      <Dialog
        open={tournamentDetailsOpen}
        onClose={() => setTournamentDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            color: "white",
            "& .MuiDialogContent-root": {
              padding: "24px",
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              color: "white",
              "& .MuiTypography-root": {
                color: "white",
              },
            },
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>Tournament Details</DialogTitle>
        <DialogContent>
          {selectedTournament && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                {selectedTournament.name}
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon sx={{ color: "white" }} />
                  <Typography sx={{ color: "white" }}>
                    {selectedTournament.date}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimeIcon sx={{ color: "white" }} />
                  <Typography sx={{ color: "white" }}>
                    {selectedTournament.time}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationIcon sx={{ color: "white" }} />
                  <Typography sx={{ color: "white" }}>
                    {selectedTournament.location}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ color: "white" }}
                >
                  Participants
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {selectedTournament.participants.map((participant) => (
                    <Box
                      key={participant.userId}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                      }}
                    >
                      <Typography sx={{ color: "white" }}>
                        {participant.username}
                      </Typography>
                      <Chip
                        label={participant.status}
                        size="small"
                        color={
                          participant.status === ParticipantStatus.CONFIRMED
                            ? "success"
                            : participant.status === ParticipantStatus.DECLINED
                            ? "error"
                            : "default"
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "rgba(15, 23, 42, 0.95)" }}>
          <Button
            onClick={() => setTournamentDetailsOpen(false)}
            sx={{ color: "white" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tournament Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Tournament</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tournament Name"
              value={editingTournament.name || ""}
              onChange={(e) =>
                setEditingTournament({
                  ...editingTournament,
                  name: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={editingTournament.date || ""}
              onChange={(e) =>
                setEditingTournament({
                  ...editingTournament,
                  date: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              type="time"
              value={editingTournament.time || ""}
              onChange={(e) =>
                setEditingTournament({
                  ...editingTournament,
                  time: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Location"
              value={editingTournament.location || ""}
              onChange={(e) =>
                setEditingTournament({
                  ...editingTournament,
                  location: e.target.value,
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTournament} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTournamentToDelete(null);
        }}
      >
        <DialogTitle>Delete Tournament</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the tournament "
            {tournamentToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setTournamentToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentView;
