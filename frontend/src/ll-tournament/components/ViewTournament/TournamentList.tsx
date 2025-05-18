import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  Divider,
  Badge,
  Avatar,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  SportsTennis as SportsIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Tournament } from "../types";

interface TournamentListProps {
  tournaments: Tournament[];
  onDeleteTournament: (tournament: Tournament) => void;
  onEditTournament: (tournament: Tournament) => void;
  onCreateTournament: () => void;
  isAdmin: boolean;
}

export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  onDeleteTournament,
  onEditTournament,
  isAdmin,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    tournament: Tournament
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTournament(tournament);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTournament(null);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedTournament?.id) {
      onDeleteTournament(selectedTournament);
    }
    handleMenuClose();
  };

  const handleEdit = (event: React.MouseEvent, tournament: Tournament) => {
    event.stopPropagation();
    onEditTournament(tournament);
  };

  // Format date in a more readable way
  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time in a more readable way
  const formatTime = (dateString: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get tournament status chip
  const getTournamentStatusChip = (tournament: Tournament) => {
    // Determine status based on dates and completion
    const now = new Date();
    const startDate = tournament.startDate
      ? new Date(tournament.startDate)
      : null;

    if (tournament.completed) {
      return (
        <Chip
          label="Completed"
          size="small"
          icon={<TrophyIcon />}
          sx={{
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            color: "#4caf50",
            fontWeight: "bold",
          }}
        />
      );
    } else if (startDate && startDate > now) {
      return (
        <Chip
          label="Upcoming"
          size="small"
          sx={{
            backgroundColor: "rgba(33, 150, 243, 0.2)",
            color: "#2196f3",
            fontWeight: "bold",
          }}
        />
      );
    } else {
      return (
        <Chip
          label="In Progress"
          size="small"
          sx={{
            backgroundColor: "rgba(255, 152, 0, 0.2)",
            color: "#ff9800",
            fontWeight: "bold",
          }}
        />
      );
    }
  };

  // Get tournament background gradient based on format
  const getTournamentBackground = (tournament: Tournament) => {
    switch (tournament.format?.toLowerCase()) {
      case "knockout":
      case "elimination":
        return "linear-gradient(135deg, rgba(33, 33, 33, 0.7) 0%, rgba(66, 66, 66, 0.9) 100%)";
      case "round robin":
        return "linear-gradient(135deg, rgba(26, 35, 60, 0.7) 0%, rgba(40, 50, 78, 0.9) 100%)";
      case "swiss":
        return "linear-gradient(135deg, rgba(27, 40, 56, 0.7) 0%, rgba(30, 50, 70, 0.9) 100%)";
      default:
        return "linear-gradient(135deg, rgba(57, 11, 45, 0.7) 0%, rgba(122, 53, 121, 0.9) 100%)";
    }
  };

  return (
    <Stack spacing={3}>
      {tournaments.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "rgba(30, 40, 60, 0.4)",
            color: "white",
            borderRadius: 2,
          }}
        >
          <SportsIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
          <Typography variant="h6">No Tournaments Available</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
            There are currently no tournaments to display.
          </Typography>
        </Paper>
      ) : (
        tournaments.map((tournament) => (
          <Paper
            key={tournament.id}
            elevation={3}
            sx={{
              p: 0,
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: 2,
              overflow: "hidden",
              background: getTournamentBackground(tournament),
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
              },
              position: "relative",
            }}
          >
            {/* Tournament Header */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 48,
                    height: 48,
                  }}
                >
                  <TrophyIcon sx={{ color: "gold" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {tournament.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 0.5,
                      gap: 1,
                    }}
                  >
                    {getTournamentStatusChip(tournament)}
                    {tournament.format && (
                      <Chip
                        label={tournament.format}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              {isAdmin && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Edit Tournament">
                    <IconButton
                      onClick={(event) => handleEdit(event, tournament)}
                      sx={{
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Tournament Options">
                    <IconButton
                      onClick={(event) => handleMenuClick(event, tournament)}
                      sx={{
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Tournament Details */}
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 2, md: 3 },
                  justifyContent: { xs: "space-between", sm: "flex-start" },
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon sx={{ opacity: 0.7, fontSize: 20 }} />
                  <Typography variant="body2">
                    {formatDate(tournament.date || tournament.startDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimeIcon sx={{ opacity: 0.7, fontSize: 20 }} />
                  <Typography variant="body2">
                    {tournament.time ||
                      (tournament.startDate &&
                        formatTime(tournament.startDate))}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationIcon sx={{ opacity: 0.7, fontSize: 20 }} />
                  <Typography variant="body2">
                    {tournament.location || "TBD"}
                  </Typography>
                </Box>
              </Box>

              {/* Additional Details */}
              {(tournament.participantsCount || tournament.description) && (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {tournament.participantsCount && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: tournament.description ? 1 : 0,
                      }}
                    >
                      <PeopleIcon sx={{ opacity: 0.7, fontSize: 20 }} />
                      <Typography variant="body2">
                        {tournament.participantsCount} Participants
                      </Typography>
                    </Box>
                  )}

                  {tournament.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        opacity: 0.8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {tournament.description}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        ))
      )}

      {selectedTournament && (
        <Menu
          key={`menu-${selectedTournament.id}`}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(event) => event.stopPropagation()}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 180,
              backgroundColor: "#1f2937",
              color: "white",
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            },
          }}
        >
          <MenuItem onClick={handleDelete} sx={{ color: "#f87171" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Tournament
          </MenuItem>
        </Menu>
      )}
    </Stack>
  );
};

export default TournamentList;
