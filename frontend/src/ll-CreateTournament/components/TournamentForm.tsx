import React from "react";
import { TextField, Stack, Box, Alert } from "@mui/material";
import { Tournament } from "../../ll-tournament/types";

interface TournamentFormProps {
  newTournament: Partial<Tournament>;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
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
    <Stack spacing={3} sx={{ width: "100%" }}>
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.name}
        </Alert>
      )}
      <TextField
        label="Tournament Name"
        value={newTournament.name || ""}
        onChange={(e) => onTournamentChange("name", e.target.value)}
        fullWidth
        disabled={isCreating}
        error={!!errors.name}
        helperText={errors.name}
        required
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
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
    </Stack>
  );
};

export default TournamentForm;
