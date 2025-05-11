import { Box, TextField } from "@mui/material";

interface TournamentFormProps {
  newTournament: {
    name: string;
    location: string;
    date: string;
    time: string;
    rounds?: number;
  };
  onTournamentChange: (field: string, value: string | number) => void;
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

  const commonTextFieldProps = {
    disabled: isCreating,
    fullWidth: true,
    sx: {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        "&:hover fieldset": {
          borderColor: "rgba(255, 255, 255, 0.3)",
        },
        "&.Mui-focused fieldset": {
          borderColor: "primary.main",
        },
      },
      "& .MuiInputLabel-root": {
        color: "rgba(255, 255, 255, 0.7)",
      },
      "& .MuiInputBase-input": {
        color: "white",
      },
      "& .MuiSvgIcon-root": {
        color: "white",
      },
    },
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <TextField
        label="Tournament Name"
        value={newTournament.name}
        onChange={handleChange("name")}
        error={!!errors.name}
        helperText={errors.name}
        {...commonTextFieldProps}
      />
      <TextField
        fullWidth
        label="Location"
        value={newTournament.location || ""}
        onChange={(e) => onTournamentChange("location", e.target.value)}
        error={!!errors.location}
        helperText={errors.location}
        disabled={isCreating}
      />
      <TextField
        label="Date"
        type="date"
        value={newTournament.date}
        onChange={handleChange("date")}
        error={!!errors.date}
        helperText={errors.date}
        InputLabelProps={{ shrink: true }}
        {...commonTextFieldProps}
      />
      <TextField
        label="Time"
        type="time"
        value={newTournament.time}
        onChange={handleChange("time")}
        error={!!errors.time}
        helperText={errors.time}
        InputLabelProps={{ shrink: true }}
        {...commonTextFieldProps}
      />
      <TextField
        fullWidth
        label="Number of Rounds (Best of X)"
        type="number"
        value={newTournament.rounds || 5}
        onChange={(e) => onTournamentChange("rounds", parseInt(e.target.value))}
        inputProps={{ min: 1, max: 9 }}
        disabled={isCreating}
      />
    </Box>
  );
};
