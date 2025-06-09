import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  SportsSoccer,
  SportsBasketball,
  SportsVolleyball,
  SportsTennis,
  SportsCricket,
  SportsHockey,
  SportsGolf,
  SportsRugby,
  SportsKabaddi,
  SportsMartialArts,
} from "@mui/icons-material";

interface Sport {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
}

const sports: Sport[] = [
  { id: "soccer", name: "Soccer", emoji: "⚽", icon: <SportsSoccer /> },
  {
    id: "basketball",
    name: "Basketball",
    emoji: "🏀",
    icon: <SportsBasketball />,
  },
  {
    id: "volleyball",
    name: "Volleyball",
    emoji: "🏐",
    icon: <SportsVolleyball />,
  },
  { id: "tennis", name: "Tennis", emoji: "🎾", icon: <SportsTennis /> },
  { id: "cricket", name: "Cricket", emoji: "🏏", icon: <SportsCricket /> },
  { id: "hockey", name: "Hockey", emoji: "🏒", icon: <SportsHockey /> },
  { id: "golf", name: "Golf", emoji: "⛳", icon: <SportsGolf /> },
  { id: "rugby", name: "Rugby", emoji: "🏉", icon: <SportsRugby /> },
  { id: "kabaddi", name: "Kabaddi", emoji: "🤼", icon: <SportsKabaddi /> },
  {
    id: "martial-arts",
    name: "Martial Arts",
    emoji: "🥋",
    icon: <SportsMartialArts />,
  },
];

interface TournamentSportSelectorProps {
  selectedSport: string | null;
  onSportChange: (sportId: string | null) => void;
}

const TournamentSportSelector: React.FC<TournamentSportSelectorProps> = ({
  selectedSport,
  onSportChange,
}) => {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        backgroundColor: "rgba(103,58,183,0.05)",
        borderRadius: 2,
        border: "1px solid rgba(103,58,183,0.2)",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          mb: 2,
          fontWeight: 600,
          background: "linear-gradient(45deg, #673AB7, #9C27B0)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Tournament Sport
      </Typography>

      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
          Select Sport
        </InputLabel>
        <Select
          value={selectedSport || ""}
          onChange={(e) => onSportChange(e.target.value || null)}
          label="Select Sport"
          sx={{
            color: "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(103,58,183,0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(103,58,183,0.5)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#673AB7",
            },
            "& .MuiSelect-icon": {
              color: "rgba(255,255,255,0.7)",
            },
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {sports.map((sport) => (
            <MenuItem
              key={sport.id}
              value={sport.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&:hover": {
                  backgroundColor: "rgba(103,58,183,0.1)",
                },
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{sport.emoji}</span>
              {sport.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSport && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1,
            backgroundColor: "rgba(103,58,183,0.1)",
            borderRadius: 1,
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>
            {sports.find((s) => s.id === selectedSport)?.emoji}
          </span>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
            {sports.find((s) => s.id === selectedSport)?.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TournamentSportSelector;
