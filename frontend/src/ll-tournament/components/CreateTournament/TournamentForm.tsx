import { Box, TextField } from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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
      "& .MuiInputAdornment-root .MuiSvgIcon-root": {
        color: "white",
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          label="Location"
          value={newTournament.location || ""}
          onChange={(e) => onTournamentChange("location", e.target.value)}
          error={!!errors.location}
          helperText={errors.location}
          {...commonTextFieldProps}
        />
        <DatePicker
          label="Date"
          value={newTournament.date ? dayjs(newTournament.date) : null}
          onChange={(value) =>
            onTournamentChange("date", value ? value.format("YYYY-MM-DD") : "")
          }
          slotProps={{
            textField: {
              error: !!errors.date,
              helperText: errors.date,
              ...commonTextFieldProps,
            },
          }}
        />
        <TimePicker
          label="Time"
          value={newTournament.time ? dayjs(newTournament.time, "HH:mm") : null}
          onChange={(value) =>
            onTournamentChange("time", value ? value.format("HH:mm") : "")
          }
          slotProps={{
            textField: {
              error: !!errors.time,
              helperText: errors.time,
              ...commonTextFieldProps,
            },
          }}
        />
        <TextField
          label="Number of Rounds (Best of X)"
          type="number"
          value={newTournament.rounds || 5}
          onChange={(e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 9) val = 9;
            if (val % 2 === 0) val = val - 1; // Ensure odd
            onTournamentChange("rounds", val);
          }}
          inputProps={{ min: 1, max: 9, step: 2 }}
          {...commonTextFieldProps}
        />
      </Box>
    </LocalizationProvider>
  );
};
