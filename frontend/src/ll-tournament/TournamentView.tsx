import React, { useState, useEffect } from "react";
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
} from "./types";
import { tournamentService } from "./services/tournamentService";
import { authService } from "../services/api";
import TournamentTabs from "./components/TournamentTabs";
import TournamentDetailsDialog from "./components/TournamentDetailsDialog";
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

interface UserProfileData {
  username: string;
  bio: string;
  favoriteSports: string[];
  profilePicture?: string;
}

const TournamentView: React.FC<TournamentViewProps> = ({
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
  const [tournamentToDelete, setTournamentToDelete] =
    useState<Tournament | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBracket] = useState(false);

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

  const handleCreateTournament = async (tournamentData: any) => {
    setIsCreating(true);
    try {
      const initialParticipants = channelUsers.map((user) => ({
        id: user.id,
        userId: user.id,
        username: user.username,
        status: ParticipantStatus.PENDING,
        stats: {
          wins: 0,
          losses: 0,
          winRate: 0,
        },
      }));

      console.log("Creating tournament with data:", tournamentData);

      const backendData = {
        name: tournamentData.name,
        description: "Tournament created through the LeagueLink platform",
        channelId: channelId,
        format: "single_elimination",
        startDate: tournamentData.startDate,
        location: tournamentData.location,
        maxParticipants: 32,
        rules: "Standard tournament rules apply",
        prizes: "Trophies for winners",
        participants: [
          ...initialParticipants,
          ...(tournamentData.participants || []),
        ],
        matches: tournamentData.matches || [],
      };

      console.log("Sending tournament data to backend:", backendData);

      const createdTournament = await tournamentService.createTournament(
        channelId,
        {
          ...backendData,
          format: "single_elimination" as const,
        }
      );

      setTournaments((prev) => [...prev, createdTournament]);
      setNewTournament({});
      setCreateDialogOpen(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create tournament:", error);
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
    console.log("Selected tournament:", tournament);
    console.log("Tournament matches:", tournament.matches);
    setSelectedTournament(tournament);
    setTournamentDetailsOpen(true);
  };

  const handleUpdateTournament = async (updatedTournament: Tournament) => {
    try {
      setIsUpdating(true);
      await tournamentService.updateTournament(
        updatedTournament.id,
        updatedTournament
      );
      setSelectedTournament(updatedTournament);
      await loadData();
    } catch (error) {
      console.error("Error updating tournament:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTournamentChange = (field: keyof Tournament, value: any) => {
    console.log("Tournament change:", field, value); // Debug log
    setNewTournament((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      <TournamentTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userStats={userStats}
        tournaments={tournaments}
        isAdmin={isAdmin}
        onUserClick={handleUserClick}
        onTournamentClick={handleTournamentClick}
        onEditTournament={handleEditTournament}
        onDeleteTournament={handleDeleteTournament}
        onCreateTournament={() => setCreateDialogOpen(true)}
      />

      <CreateTournamentDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateTournament}
        newTournament={newTournament}
        onTournamentChange={handleTournamentChange}
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

      <TournamentDetailsDialog
        open={tournamentDetailsOpen}
        onClose={() => setTournamentDetailsOpen(false)}
        tournament={selectedTournament}
        onUpdateMatch={handleUpdateMatch}
      />

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
          onUpdateTournament={handleUpdateTournament}
          onUpdateMatch={handleUpdateMatch}
        />
      )}
    </Box>
  );
};

export default TournamentView;
