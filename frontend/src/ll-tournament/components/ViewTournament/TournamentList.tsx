import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Tournament } from "../../types";

interface TournamentListProps {
  tournaments: Tournament[];
  onTournamentClick: (tournament: Tournament) => void;
  onDeleteTournament: (tournament: Tournament) => void;
  onCreateTournament: () => void;
  isAdmin: boolean;
}

export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  onTournamentClick,
  onDeleteTournament,
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

  return (
    <Stack spacing={2}>
      {tournaments.map((tournament) => (
        <Paper
          key={tournament.id}
          sx={{
            p: 2,
            backgroundColor: "rgba(216, 22, 22, 0.05)",
            color: "white",
            cursor: "pointer",
            transition: "background 0.2s",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.10)" },
          }}
          onClick={() => onTournamentClick(tournament)}
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
              <Tooltip title="Tournament Options">
                <IconButton
                  onClick={(event) => handleMenuClick(event, tournament)}
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
          {tournament.statsConfig && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Enabled Statistics:</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {tournament.statsConfig.enabledStats.map((stat) => (
                  <Chip
                    key={`${tournament.id}-${stat}`}
                    label={stat}
                    size="small"
                    sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      ))}

      {selectedTournament && (
        <Menu
          key={`menu-${selectedTournament.id}`}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(event) => event.stopPropagation()}
        >
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete Tournament
          </MenuItem>
        </Menu>
      )}
    </Stack>
  );
};

export default TournamentList;
