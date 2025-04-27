import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Tournament } from "../types";

interface TournamentListProps {
  tournaments: Tournament[];
  isAdmin: boolean;
  onStatsConfigClick: (tournament: Tournament) => void;
}

const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  isAdmin,
  onStatsConfigClick,
}) => {
  return (
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
                  onClick={() => onStatsConfigClick(tournament)}
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
            <Typography variant="subtitle2">Enabled Statistics:</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
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
  );
};

export default TournamentList;
