import { Box, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { tournamentService } from "../../../services/api";
import { CreateTournamentDialogProps } from "../../types";
import { useState } from "react";

interface TournamentFormProps
  extends Omit<CreateTournamentDialogProps, "open" | "onClose" | "onSubmit"> {
  errors: Record<string, string>;
  setErrors?: (errors: Record<string, string>) => void;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  newTournament,
  onTournamentChange,
  errors,
  setErrors,
  isCreating,
  isEditing,
  existingTournament,
  channelId,
  onSubmit,
  onClose,
}) => {
  // ערכי ברירת מחדל למקרה שלא הועבר setErrors
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // שימוש בפונקציית setErrors שהועברה או בפונקציה המקומית
  const updateErrors = (newErrors: Record<string, string>) => {
    if (setErrors) {
      setErrors(newErrors);
    } else {
      setLocalErrors(newErrors);
    }
  };

  // מיזוג שגיאות מקומיות ושגיאות שהועברו
  const currentErrors = { ...localErrors, ...errors };

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

  const validateTime = (time: string) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateDate = (date: string) => {
    if (!date) return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newTournament.name?.trim()) {
      newErrors.name = "Tournament name is required";
    } else if (newTournament.name.trim().length < 3) {
      newErrors.name = "Tournament name must be at least 3 characters";
    }

    if (!newTournament.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!newTournament.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (!validateDate(newTournament.startDate)) {
      newErrors.startDate = "Invalid date. Please select a valid future date.";
    }

    if (!newTournament.time) {
      newErrors.time = "Start time is required";
    } else if (!validateTime(newTournament.time)) {
      newErrors.time = "Invalid time format. Please use 24-hour format (HH:mm)";
    }

    // עדכון מצב השגיאות
    updateErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const tournamentData = {
        name: newTournament.name.trim(),
        description: newTournament.description?.trim() || "",
        date: newTournament.startDate,
        time: newTournament.time,
        location: newTournament.location.trim(),
      };

      if (isEditing && existingTournament) {
        const response = await tournamentService.updateTournament(
          existingTournament.id,
          {
            name: tournamentData.name,
            description: tournamentData.description,
            date: tournamentData.date,
            time: tournamentData.time,
            location: tournamentData.location,
          }
        );
        if (response.success) {
          onSubmit(response.data);
          onClose();
        }
      } else if (channelId) {
        const response = await tournamentService.createTournament(
          channelId,
          tournamentData
        );
        if (response.success) {
          onSubmit(response.data);
          onClose();
        }
      } else {
        // טיפול במקרה שלא הועבר channelId
        throw new Error("Channel ID is required for creating a tournament");
      }
    } catch (error: any) {
      console.error("Error submitting tournament:", error);
      onSubmit({ error: error.message || "Error submitting tournament" });

      // עדכון שגיאה כללית
      updateErrors({
        ...currentErrors,
        general: error.message || "Error submitting tournament",
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {currentErrors.general && (
          <Box sx={{ color: "error.main", mb: 2 }}>{currentErrors.general}</Box>
        )}

        <TextField
          label="Tournament Name"
          value={newTournament.name || ""}
          onChange={handleChange("name")}
          error={!!currentErrors.name}
          helperText={currentErrors.name}
          {...commonTextFieldProps}
        />
        <TextField
          label="Description"
          value={newTournament.description || ""}
          onChange={handleChange("description")}
          error={!!currentErrors.description}
          helperText={currentErrors.description}
          multiline
          rows={3}
          {...commonTextFieldProps}
        />
        <TextField
          label="Location"
          value={newTournament.location || ""}
          onChange={handleChange("location")}
          error={!!currentErrors.location}
          helperText={currentErrors.location}
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
              error: !!currentErrors.startDate,
              helperText: currentErrors.startDate,
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
          ampm={false}
          slotProps={{
            textField: {
              error: !!currentErrors.time,
              helperText: currentErrors.time,
              ...commonTextFieldProps,
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};
