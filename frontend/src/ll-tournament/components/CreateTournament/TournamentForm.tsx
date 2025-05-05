import React from "react";
import { TextField, Box } from "@mui/material";

interface TournamentFormProps {
  newTournament: any;
  onTournamentChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  isCreating: boolean;
}

const TournamentForm: React.FC<TournamentFormProps> = ({
  newTournament,
  onTournamentChange,
  errors,
  isCreating,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Tournament Name"
        value={newTournament.name || ""}
        onChange={(e) => onTournamentChange("name", e.target.value)}
        fullWidth
        disabled={isCreating}
        error={!!errors.name}
        helperText={errors.name}
        required
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Location"
          value={newTournament.location || ""}
          onChange={(e) => onTournamentChange("location", e.target.value)}
          fullWidth
          disabled={isCreating}
          error={!!errors.location}
          helperText={errors.location}
          required
        />
        <TextField
          label="Date"
          type="date"
          value={newTournament.date || ""}
          onChange={(e) => onTournamentChange("date", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          disabled={isCreating}
          error={!!errors.date}
          helperText={errors.date}
          required
        />
        <TextField
          label="Time"
          type="time"
          value={newTournament.time || ""}
          onChange={(e) => onTournamentChange("time", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          disabled={isCreating}
          error={!!errors.time}
          helperText={errors.time}
          required
        />
      </Box>
    </Box>
  );
};

export default TournamentForm;
