import React from "react";
import { Box, TextField } from "@mui/material";

interface TournamentFormProps {
  newTournament: {
    name: string;
    location: string;
    date: string;
    time: string;
  };
  onTournamentChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  isCreating: boolean;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  newTournament,
  onTournamentChange,
  errors,
  isCreating,
}) => {
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onTournamentChange(field, event.target.value);
    };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <TextField
        label="Tournament Name"
        value={newTournament.name}
        onChange={handleChange("name")}
        error={!!errors.name}
        helperText={errors.name}
        disabled={isCreating}
        fullWidth
      />
      <TextField
        label="Location"
        value={newTournament.location}
        onChange={handleChange("location")}
        error={!!errors.location}
        helperText={errors.location}
        disabled={isCreating}
        fullWidth
      />
      <TextField
        label="Date"
        type="date"
        value={newTournament.date}
        onChange={handleChange("date")}
        error={!!errors.date}
        helperText={errors.date}
        disabled={isCreating}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label="Time"
        type="time"
        value={newTournament.time}
        onChange={handleChange("time")}
        error={!!errors.time}
        helperText={errors.time}
        disabled={isCreating}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
    </Box>
  );
};
