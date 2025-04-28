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
    setSelectedTournament(tournament);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTournament) return;
    try {
      await tournamentService.deleteTournament(selectedTournament.id);
      setDeleteDialogOpen(false);
      setSelectedTournament(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete tournament:", error);
    }
  };

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setTournamentDetailsOpen(true);
  };

  const handleUpdateTournament = async (updatedTournament: Tournament) => {
    try {
      await tournamentService.updateTournament(
        updatedTournament.id,
        updatedTournament
      );
      setEditDialogOpen(false);
      setSelectedTournament(null);
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
              onStatsConfigClick={(tournament) => {
                setSelectedTournament(tournament);
                setStatsConfigDialogOpen(true);
              }}
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
      >
        <DialogTitle>Tournament Details</DialogTitle>
        <DialogContent>
          {selectedTournament && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedTournament.name}</Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon />
                  <Typography>{selectedTournament.date}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimeIcon />
                  <Typography>{selectedTournament.time}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationIcon />
                  <Typography>{selectedTournament.location}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Participants</Typography>
                {selectedTournament.participants.map((participant) => (
                  <Box key={participant.userId} sx={{ mt: 1 }}>
                    <Typography>{participant.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {participant.status}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTournamentDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Tournament</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the tournament "
            {selectedTournament?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentView;
