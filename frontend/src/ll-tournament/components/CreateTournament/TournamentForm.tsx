import { Box, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface TournamentFormProps {
  newTournament: {
    name: string;
    description: string;
    location: string;
    startDate: string;
    time: string;
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Tournament Name"
          value={newTournament.name}
          onChange={handleChange("name")}
          error={!!errors.name}
          helperText={errors.name}
          {...commonTextFieldProps}
        />
        <TextField
          label="Description"
          value={newTournament.description || ""}
          onChange={handleChange("description")}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          rows={3}
          {...commonTextFieldProps}
        />
        <TextField
          label="Location"
          value={newTournament.location || ""}
          onChange={handleChange("location")}
          error={!!errors.location}
          helperText={errors.location}
          {...commonTextFieldProps}
        />
        <DatePicker
          label="Start Date"
          value={
            newTournament.startDate ? dayjs(newTournament.startDate) : null
          }
          onChange={(value) =>
            onTournamentChange(
              "startDate",
              value ? value.format("YYYY-MM-DD") : ""
            )
          }
          slotProps={{
            textField: {
              error: !!errors.startDate,
              helperText: errors.startDate,
              ...commonTextFieldProps,
            },
          }}
        />
        <TimePicker
          label="Start Time"
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
      </Box>
    </LocalizationProvider>
  );
};
