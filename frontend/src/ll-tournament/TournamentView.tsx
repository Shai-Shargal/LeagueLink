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
  Stack,
  Paper,
  Avatar,
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
import EditTournamentDialog from "./components/EditTournamentDialog";
import TournamentBracket from "./components/TournamentBracket";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBracket, setShowBracket] = useState(false);

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
    setSelectedTournament(tournament);
    setTournamentDetailsOpen(true);
  };

  const handleUpdateTournament = async () => {
    if (!selectedTournament) return;

    try {
      setIsUpdating(true);
      await tournamentService.updateTournament(
        selectedTournament.id,
        selectedTournament
      );
      setEditDialogOpen(false);
      setSelectedTournament(null);
      // Refresh tournaments list
      const updatedTournaments = await tournamentService.getChannelTournaments(
        channelId
      );
      setTournaments(updatedTournaments);
    } catch (error) {
      console.error("Error updating tournament:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTournamentChange = (field: keyof Tournament, value: any) => {
    if (selectedTournament) {
      setSelectedTournament({
        ...selectedTournament,
        [field]: value,
      });
    }
  };

  const handleUpdateMatch = async (match: any) => {
    if (!selectedTournament) return;
    try {
      // Update the match in the tournament
      const updatedTournament = {
        ...selectedTournament,
        matches: selectedTournament.matches?.map((m) =>
          m.id === match.id ? match : m
        ) || [match],
      };
      await tournamentService.updateTournament(
        selectedTournament.id,
        updatedTournament
      );
      setSelectedTournament(updatedTournament);
    } catch (error) {
      console.error("Failed to update match:", error);
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
          <Box
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              display: "flex",
              gap: 2,
            }}
          >
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
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 1200,
            height: 600,
            borderRadius: 3,
            boxShadow: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 0,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 600,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "rgba(15, 23, 42, 0.95)",
            borderBottom: 1,
            borderColor: "divider",
            color: "white",
          }}
        >
          Tournament Details
        </DialogTitle>
        <DialogContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            p: 4,
            overflowY: "auto",
            background: "rgba(15, 23, 42, 0.95)",
          }}
        >
          {selectedTournament && (
            <Stack spacing={3} sx={{ width: "100%" }}>
              <TextField
                label="Tournament Name"
                value={selectedTournament.name}
                fullWidth
                disabled
                sx={{ mb: 1 }}
                InputProps={{
                  sx: { color: "white" },
                }}
                InputLabelProps={{
                  sx: { color: "white" },
                }}
              />
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <TextField
                  label="Location"
                  value={selectedTournament.location}
                  fullWidth
                  disabled
                  InputProps={{
                    sx: { color: "white" },
                  }}
                  InputLabelProps={{
                    sx: { color: "white" },
                  }}
                />
                <TextField
                  label="Date"
                  type="date"
                  value={selectedTournament.date}
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: "white" },
                  }}
                  fullWidth
                  disabled
                  InputProps={{
                    sx: { color: "white" },
                  }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={selectedTournament.time}
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: "white" },
                  }}
                  fullWidth
                  disabled
                  InputProps={{
                    sx: { color: "white" },
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  gap: 3,
                  minHeight: 400,
                }}
              >
                <Paper
                  sx={{
                    flex: 7,
                    minWidth: 0,
                    height: 400,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    border: "2px dashed",
                    borderColor: "divider",
                    background: "transparent",
                    color: "text.secondary",
                    mr: 2,
                    overflowY: "auto",
                    p: 2,
                  }}
                  elevation={0}
                >
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Participants
                  </Typography>
                  {channelUsers.map((user) => {
                    const participant = selectedTournament.participants.find(
                      (p) => p.userId === user.id
                    );
                    return (
                      <Box
                        key={user.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          p: 1,
                          mb: 1,
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            src={user.profilePicture}
                            alt={user.username}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Typography sx={{ color: "white" }}>
                            {user.username}
                          </Typography>
                        </Box>
                        <Chip
                          label={
                            participant?.status || ParticipantStatus.PENDING
                          }
                          size="small"
                          color={
                            participant?.status === ParticipantStatus.CONFIRMED
                              ? "success"
                              : participant?.status ===
                                ParticipantStatus.DECLINED
                              ? "error"
                              : "default"
                          }
                        />
                      </Box>
                    );
                  })}
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: "divider",
            background: "rgba(15, 23, 42, 0.95)",
          }}
        >
          <Button
            onClick={() => setTournamentDetailsOpen(false)}
            sx={{ color: "white" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <EditTournamentDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedTournament(null);
        }}
        onSubmit={handleUpdateTournament}
        tournament={selectedTournament || ({} as Tournament)}
        onTournamentChange={handleTournamentChange}
        isUpdating={isUpdating}
      />

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

      {showBracket && selectedTournament && (
        <TournamentBracket
          tournament={selectedTournament}
          onUpdateMatch={handleUpdateMatch}
        />
      )}
    </Box>
  );
};

export default TournamentView;
