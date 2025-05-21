import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  Tournament,
  ChannelUserStats,
  TournamentStatsConfig,
  ParticipantStatus,
  Match,
} from "../../types/index";
import { tournamentService } from "../../services/tournamentService";
import { authService } from "../../../services/api";
import TournamentTabs from "../ViewStats/TournamentTabs";
import CreateTournamentDialog from "../CreateTournament/CreateTournamentDialog";
import StatsConfigDialog from "../ViewStats/StatsConfigDialog";
import UserProfileDialog from "../UserProfileDialog";
import EditTournament from "../EditTournament/EditTournament";
import TimeIcon from "@mui/icons-material/AccessTime";

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
  const [editTournamentOpen, setEditTournamentOpen] = useState(false);
  const [statsConfigDialogOpen, setStatsConfigDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [userStats, setUserStats] = useState<ChannelUserStats[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTournament, setNewTournament] = useState<{
    name: string;
    description: string;
    location: string;
    startDate: string;
    time: string;
    statsConfig: TournamentStatsConfig;
  }>({
    name: "",
    description: "",
    location: "",
    startDate: "",
    time: "",
    statsConfig: defaultStatsConfig,
  });
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(
    null
  );
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] =
    useState<Tournament | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null
  );

  const fetchTournaments = async () => {
    try {
      const fetchedTournaments =
        await tournamentService.getChannelTournaments(channelId);
      setTournaments(fetchedTournaments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch tournaments"
      );
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [channelId]);

  useEffect(() => {
    loadData();
  }, [channelId]);

  const loadData = async () => {
    try {
      // Fetch tournaments for the current channel only
      const fetchedTournaments =
        await tournamentService.getChannelTournaments(channelId);

      // Filter tournaments to ensure they belong to the current channel
      const channelTournaments = fetchedTournaments.filter(
        (tournament) => tournament.channelId === channelId
      );

      setTournaments(channelTournaments);

      // Initialize default stats for all users
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
    } catch (error) {
      console.error("Failed to load data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
      // Initialize empty state
      setTournaments([]);
      setUserStats([]);
    }
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setEditTournamentOpen(true);
  };

  const handleCreateTournament = async (tournamentData: any) => {
    try {
      setIsCreating(true);
      if (editingTournament) {
        // Update existing tournament
        const response = await tournamentService.updateTournament(
          editingTournament.id,
          tournamentData
        );
        if (response.success) {
          await fetchTournaments();
          setCreateDialogOpen(false);
          setEditingTournament(null);
          setNewTournament({
            name: "",
            description: "",
            location: "",
            startDate: "",
            time: "",
            statsConfig: defaultStatsConfig,
          });
        }
      } else {
        // Create new tournament
        const response = await tournamentService.createTournament(
          channelId,
          tournamentData
        );
        if (response.success) {
          await fetchTournaments();
          setCreateDialogOpen(false);
          setEditingTournament(null);
          setNewTournament({
            name: "",
            description: "",
            location: "",
            startDate: "",
            time: "",
            statsConfig: defaultStatsConfig,
          });
        }
      }
    } catch (err) {
      console.error("Error creating/updating tournament:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setEditingTournament(null);
    setNewTournament({
      name: "",
      description: "",
      location: "",
      startDate: "",
      time: "",
      statsConfig: defaultStatsConfig,
    });
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
      await tournamentService.deleteTournament(tournamentToDelete.id);
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
      await loadData(); // Wait for data to reload
    } catch (error) {
      console.error("Failed to delete tournament:", error);
      // Show error to user
      setError(
        error instanceof Error ? error.message : "Failed to delete tournament"
      );
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
    }
  };

  const handleTournamentChange = (field: string, value: string | number) => {
    setNewTournament((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateMatch = async (match: Match) => {
    if (!selectedTournament) return;
    try {
      // Update the match in the tournament
      const updatedTournament: Tournament = {
        ...selectedTournament,
        matches: selectedTournament.matches?.map((m: Match) =>
          m.id === match.id
            ? {
                ...match,
                round: match.round || 1,
                matchNumber: match.matchNumber || 1,
              }
            : m
        ) || [
          {
            ...match,
            round: match.round || 1,
            matchNumber: match.matchNumber || 1,
          },
        ],
      };
      await tournamentService.updateTournament(selectedTournament.id, {
        name: updatedTournament.name,
        description: updatedTournament.description,
        location: updatedTournament.location,
        startDate: updatedTournament.startDate,
        time: updatedTournament.time,
      });
      setSelectedTournament(updatedTournament);
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const handleSaveTournament = async (updatedTournament: Tournament) => {
    try {
      // Update tournament basic info
      await tournamentService.updateTournament(updatedTournament.id, {
        name: updatedTournament.name,
        description: updatedTournament.description,
        location: updatedTournament.location,
        startDate: updatedTournament.startDate,
        time: updatedTournament.time,
      });

      // Update matches using createMatches
      if (updatedTournament.matches && updatedTournament.matches.length > 0) {
        const matchesWithDefaults = updatedTournament.matches.map((match) => ({
          ...match,
          round: match.round || 1,
          matchNumber: match.matchNumber || 1,
        }));
        await tournamentService.createMatches(
          updatedTournament.id,
          matchesWithDefaults
        );
      }

      // Refresh tournaments list
      await fetchTournaments();
      setEditTournamentOpen(false);

      console.log("Saving tournament...");
      await tournamentService.saveTournament(updatedTournament);
      console.log("Tournament saved, updating channel...");
      const updatedChannel = await tournamentService.updateChannel(
        updatedTournament.channelId,
        { $push: { tournaments: updatedTournament._id } },
        { new: true }
      );
      console.log("Channel update result:", updatedChannel);

      if (!updatedChannel) {
        return res.status(404).json({
          success: false,
          error: "Channel not found",
        });
      }
    } catch (error) {
      console.error("Error saving tournament:", error);
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
      <TournamentTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userStats={userStats}
        tournaments={tournaments}
        isAdmin={isAdmin}
        onUserClick={handleUserClick}
        onDeleteTournament={handleDeleteTournament}
        onEditTournament={handleEditTournament}
        onCreateTournament={() => setCreateDialogOpen(true)}
      />

      {editTournamentOpen && editingTournament && (
        <EditTournament
          tournament={editingTournament}
          channelUsers={channelUsers.map((user) => ({
            userId: user.id,
            username: user.username,
            isGuest: false,
            type: "player",
            id: user.id,
            status: "guest",
          }))}
          onClose={() => setEditTournamentOpen(false)}
          onSave={handleSaveTournament}
        />
      )}

      <CreateTournamentDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateTournament}
        newTournament={newTournament}
        onTournamentChange={handleTournamentChange}
        channelUsers={channelUsers.map((user) => ({
          id: user.id,
          userId: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          status: "guest",
        }))}
        isCreating={isCreating}
        isEditing={!!editingTournament}
        existingTournament={editingTournament || undefined}
        channelId={channelId}
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

      {/* Error Dialog */}
      <Dialog open={!!error} onClose={() => setError(null)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentView;
