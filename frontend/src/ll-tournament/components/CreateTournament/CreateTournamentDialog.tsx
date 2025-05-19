import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { CreateTournamentDialogProps } from "../../types";
import { TournamentForm } from "./TournamentForm";
import { tournamentService } from "../../../services/api";

const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  newTournament,
  onTournamentChange,
  isCreating,
  isEditing = false,
  existingTournament,
  channelId,
}: CreateTournamentDialogProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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
    } else {
      const selectedDate = new Date(newTournament.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.startDate = "Start date cannot be in the past";
      }
    }

    if (!newTournament.time) {
      newErrors.time = "Start time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const tournamentData = {
        name: newTournament.name,
        description: newTournament.description || "",
        channelId: channelId,
        date: newTournament.startDate,
        time: newTournament.time,
      };

      if (isEditing && existingTournament) {
        const response = await tournamentService.updateTournament(
          existingTournament.id,
          tournamentData
        );
        if (response.success) {
          setNotification({
            open: true,
            message: "Tournament updated successfully!",
            severity: "success",
          });
          onSubmit(response.data);
        }
      } else {
        const response =
          await tournamentService.createTournament(tournamentData);
        if (response.success) {
          setNotification({
            open: true,
            message: "Tournament created successfully!",
            severity: "success",
          });
          onSubmit(response.data);
        }
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting tournament:", error);
      setNotification({
        open: true,
        message: "Error submitting tournament. Please try again.",
        severity: "error",
      });
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setErrors({});
      onClose();
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.default",
            minHeight: "auto",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            "&.MuiDialogTitle-root": {
              fontSize: "1.25rem",
              padding: "16px",
              minHeight: "auto",
            },
            fontWeight: 600,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: (theme) => theme.palette.background.paper,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EmojiEventsIcon
              sx={{
                color: "primary.main",
                fontSize: "1.75rem",
              }}
            />
            <Box
              component="div"
              sx={{
                typography: "h6",
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "0.5px",
              }}
            >
              {isEditing ? "Edit Tournament" : "Create New Tournament"}
            </Box>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{
              color: "white",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            overflowY: "auto",
            background: (theme) => theme.palette.background.default,
            "&.MuiDialogContent-root": {
              paddingTop: "16px",
            },
            color: "white",
          }}
        >
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {Object.values(errors)[0]}
            </Alert>
          )}
          <Stack spacing={3} sx={{ width: "100%" }}>
            <TournamentForm
              newTournament={newTournament}
              onTournamentChange={onTournamentChange}
              errors={errors}
              isCreating={isCreating}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: "divider",
            background: (theme) => theme.palette.background.paper,
            color: "white",
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isCreating}
            sx={{ color: "white" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating}
            sx={{
              minWidth: 200,
              height: 48,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(45deg,rgb(48, 11, 65), #9333EA)",
              "&:hover": {
                background: "linear-gradient(45deg, #9333EA, #7928CA)",
              },
            }}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            {isCreating
              ? "Creating..."
              : isEditing
                ? "Update Tournament"
                : "Create Tournament"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateTournamentDialog;
