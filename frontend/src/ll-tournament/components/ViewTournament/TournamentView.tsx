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
} from "../../types";
import { tournamentService } from "../../services/tournamentService";
import { authService } from "../../../services/api";
import TournamentTabs from "../ViewStats/TournamentTabs";
import CreateTournamentDialog from "../CreateTournament/CreateTournamentDialog";
import StatsConfigDialog from "../ViewStats/StatsConfigDialog";
import UserProfileDialog from "../UserProfileDialog";
import EditTournament from "../EditTournament/EditTournament";

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

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setEditTournamentOpen(true);
  };

  const handleCreateTournament = async (tournamentData: any) => {
    try {
      setIsCreating(true);
      if (editingTournament) {
        // Update existing tournament
        await tournamentService.updateTournament(
          editingTournament.id,
          tournamentData
        );
      } else {
        // Create new tournament
        await tournamentService.createTournament(channelId, tournamentData);
      }
      await fetchTournaments();
      setCreateDialogOpen(false);
      setEditingTournament(null);
      setNewTournament({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setEditingTournament(null);
    setNewTournament({});
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

  const handleTournamentChange = async (
    field: string,
    value: string | number
  ) => {
    console.log("Tournament change:", field, value); // Debug log
    setNewTournament((prev: Partial<Tournament>) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateMatch = async (match: Match) => {
    if (!selectedTournament) return;
    try {
      // Update the match in the tournament
      const updatedTournament = {
        ...selectedTournament,
        matches: selectedTournament.matches?.map((m: Match) =>
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
            ...user,
            userId: user.id,
            status: ParticipantStatus.PENDING,
          }))}
          onClose={() => {
            setEditTournamentOpen(false);
            setEditingTournament(null);
          }}
          onSave={async (updatedTournament) => {
            try {
              await tournamentService.updateTournament(editingTournament.id, {
                ...updatedTournament,
                name: updatedTournament.name || editingTournament.name,
                description:
                  updatedTournament.description ||
                  editingTournament.description,
                location:
                  updatedTournament.location || editingTournament.location,
                startDate:
                  updatedTournament.startDate || editingTournament.startDate,
              });
              await loadData();
              setEditTournamentOpen(false);
              setEditingTournament(null);
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Failed to update tournament"
              );
            }
          }}
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
          status: ParticipantStatus.PENDING,
        }))}
        isCreating={isCreating}
        isEditing={!!editingTournament}
        existingTournament={editingTournament || undefined}
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
