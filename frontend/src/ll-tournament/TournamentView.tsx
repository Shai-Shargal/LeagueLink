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
  Grid,
  IconButton,
} from "@mui/material";
import {
  EmojiEvents as TournamentIcon,
  BarChart as StatsIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Person as PersonIcon,
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

// Constants for bracket layout
const ROUND_HORIZONTAL_GAP = 100;
const MATCH_VERTICAL_GAP = 40;
const INITIAL_TOP_MARGIN = 20;
const BASE_BOX_WIDTH = 200;
const BASE_BOX_HEIGHT = 100;

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

      // Get current date and time as fallback
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);

      // Use provided date and time or fallback to current
      const dateToUse = newTournament.date || currentDate;
      const timeToUse = newTournament.time || currentTime;

      // Create the tournament data
      const tournamentData = {
        name: newTournament.name,
        date: dateToUse,
        time: timeToUse,
        location: newTournament.location,
        participants: [
          ...initialParticipants,
          ...(newTournament.participants || []),
        ],
        matches: newTournament.matches || [],
      };

      const createdTournament = await tournamentService.createTournament(
        channelId,
        tournamentData
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
                px: 4,
                py: 2,
                minWidth: 0,
                minHeight: 0,
                fontSize: "1.1rem",
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

      {/* Tournament Details Dialog */}
      <Dialog
        open={tournamentDetailsOpen}
        onClose={() => setTournamentDetailsOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgb(30, 41, 59)",
            color: "white",
            minHeight: "80vh",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: 20,
            fontWeight: 600,
            textAlign: "center",
            padding: "8px",
            color: "white",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "40px",
          }}
        >
          <Box sx={{ flex: 1 }}></Box>
          <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
            {selectedTournament?.name}
          </Typography>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              onClick={() => setTournamentDetailsOpen(false)}
              sx={{ color: "white", padding: "4px" }}
            >
              <CloseIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: 3,
            pt: 2,
            flex: 1,
            overflow: "auto",
            backgroundColor: "rgb(30, 41, 59)",
          }}
        >
          {selectedTournament && (
            <>
              {/* Tournament Info */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  mb: 2,
                  mt: 1,
                  position: "sticky",
                  top: 0,
                  backgroundColor: "rgb(30, 41, 59)",
                  zIndex: 1,
                  py: 1,
                }}
              >
                <TextField
                  label="Location"
                  value={selectedTournament.location}
                  disabled
                  sx={{
                    width: "30%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgb(30, 41, 59)",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
                <TextField
                  label="Date"
                  value={selectedTournament.date}
                  type="date"
                  disabled
                  sx={{
                    width: "30%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgb(30, 41, 59)",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
                <TextField
                  label="Time"
                  value={selectedTournament.time}
                  type="time"
                  disabled
                  sx={{
                    width: "30%",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgb(30, 41, 59)",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />
              </Box>

              {/* Tournament Bracket */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  mt: 2,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    mb: 2,
                    position: "sticky",
                    top: 0,
                    backgroundColor: "rgb(30, 41, 59)",
                    zIndex: 1,
                    py: 1,
                  }}
                >
                  Tournament Bracket
                </Typography>

                {/* Bracket Content */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: ROUND_HORIZONTAL_GAP,
                    p: 2,
                    overflowX: "auto",
                    minHeight: 400,
                    position: "relative",
                    minWidth: "fit-content",
                  }}
                >
                  {selectedTournament?.matches &&
                  selectedTournament.matches.length > 0 ? (
                    Object.entries(
                      selectedTournament.matches.reduce((acc, match) => {
                        if (!acc[match.round]) {
                          acc[match.round] = [];
                        }
                        acc[match.round].push(match);
                        return acc;
                      }, {} as { [key: number]: typeof selectedTournament.matches })
                    ).map(([round, roundMatches]) => (
                      <Box
                        key={round}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: MATCH_VERTICAL_GAP,
                          alignItems: "flex-start",
                          minWidth: BASE_BOX_WIDTH,
                        }}
                      >
                        {roundMatches.map((match) => (
                          <Paper
                            key={match.id}
                            elevation={1}
                            sx={{
                              width: BASE_BOX_WIDTH,
                              height: BASE_BOX_HEIGHT,
                              display: "flex",
                              flexDirection: "column",
                              backgroundColor: "#242b3d",
                              borderRadius: 1,
                              position: "relative",
                              overflow: "hidden",
                              marginTop: match.position?.y
                                ? `${match.position.y}px`
                                : 0,
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                right: -ROUND_HORIZONTAL_GAP,
                                top: "50%",
                                width: ROUND_HORIZONTAL_GAP,
                                height: 2,
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                height: "50%",
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <Avatar
                                src={match.team1?.profilePicture}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              >
                                {!match.team1?.profilePicture && <PersonIcon />}
                              </Avatar>
                              <Typography
                                sx={{
                                  flex: 1,
                                  color: "rgba(255, 255, 255, 0.9)",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {match.team1?.username || "TBD"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                height: "50%",
                              }}
                            >
                              <Avatar
                                src={match.team2?.profilePicture}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              >
                                {!match.team2?.profilePicture && <PersonIcon />}
                              </Avatar>
                              <Typography
                                sx={{
                                  flex: 1,
                                  color: "rgba(255, 255, 255, 0.9)",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {match.team2?.username || "TBD"}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      No matches in this tournament
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
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
