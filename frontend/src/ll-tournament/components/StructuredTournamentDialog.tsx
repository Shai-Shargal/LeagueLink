import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Tournament, ParticipantStatus } from "../types";

interface StructuredTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournamentData: Partial<Tournament>) => void;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  isCreating: boolean;
}

interface TournamentStructure {
  groups: number;
  participantsPerGroup: number;
  knockoutRounds: string[];
  description: string;
}

const getTournamentStructure = (
  participantCount: number
): TournamentStructure => {
  if (participantCount === 6) {
    return {
      groups: 2,
      participantsPerGroup: 3,
      knockoutRounds: ["Quarterfinals", "Final"],
      description: `2 groups of 3 teams each.
1st place in Group A plays 2nd place in Group B, and vice versa.
3rd place teams are eliminated.
Winners go to the final.`,
    };
  } else if (participantCount === 8 || participantCount === 10) {
    return {
      groups: 2,
      participantsPerGroup: participantCount / 2,
      knockoutRounds: ["Quarterfinals", "Semifinals", "Final"],
      description: `2 groups of ${participantCount / 2} teams each.
1st place advances directly to semifinals.
2nd and 3rd places play quarterfinal cross matches (2A vs 3B and 2B vs 3A).
Winners meet 1st place teams in semifinals.`,
    };
  } else if (
    participantCount === 9 ||
    participantCount === 12 ||
    participantCount === 15
  ) {
    return {
      groups: 3,
      participantsPerGroup: Math.ceil(participantCount / 3),
      knockoutRounds: ["Round of 8", "Semifinals", "Final"],
      description: `3 groups of ${Math.ceil(participantCount / 3)} teams each.
Top 1st and 2nd places, plus the best two 3rd-placed teams, qualify for knockouts.
The weakest 3rd-place team is eliminated based on goal difference or wins.
Knockout pairings: strongest 1st vs weakest 3rd, etc.
Semifinals are randomized (open draw).`,
    };
  } else if (participantCount === 16) {
    return {
      groups: 4,
      participantsPerGroup: 4,
      knockoutRounds: ["Quarterfinals", "Semifinals", "Final"],
      description: `4 groups of 4 teams each.
Top 2 from each group advance to quarterfinals.
1st place faces 2nd place, either randomly or based on ranking.`,
    };
  } else if (participantCount === 20) {
    return {
      groups: 4,
      participantsPerGroup: 5,
      knockoutRounds: [
        "Preliminary Round",
        "Quarterfinals",
        "Semifinals",
        "Final",
      ],
      description: `4 groups of 5 teams each.
1st place in each group advances automatically to quarterfinals.
2nd and 3rd places enter a preliminary knockout round.
Pairings are either random or ranking-based (strongest 2nd vs weakest 3rd).`,
    };
  }
  return {
    groups: 0,
    participantsPerGroup: 0,
    knockoutRounds: [],
    description: "Invalid number of participants",
  };
};

const StructuredTournamentDialog: React.FC<StructuredTournamentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  channelUsers,
  isCreating,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [tournamentStructure, setTournamentStructure] =
    useState<TournamentStructure | null>(null);
  const [seedingMethod, setSeedingMethod] = useState<"ranking" | "random">(
    "ranking"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ["Select Participants", "Review Structure", "Confirm Details"];

  const handleNext = () => {
    if (activeStep === 0) {
      if (!participantCount || participantCount < 6 || participantCount > 20) {
        setErrors({
          participantCount:
            "Please enter a valid number of participants (6-20)",
        });
        return;
      }
      setTournamentStructure(getTournamentStructure(participantCount));
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    if (!isCreating) {
      setActiveStep(0);
      setParticipantCount(0);
      setTournamentStructure(null);
      setSeedingMethod("ranking");
      setErrors({});
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!tournamentStructure) return;

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate
      .toTimeString()
      .split(" ")[0]
      .substring(0, 5);

    const tournamentData: Partial<Tournament> = {
      name: `Structured Tournament (${participantCount} Teams)`,
      description: "Tournament created through the LeagueLink platform",
      format: "structured",
      startDate: new Date().toISOString(),
      maxParticipants: participantCount,
      rules: "Standard tournament rules apply",
      prizes: "Trophies for winners",
      date: formattedDate,
      time: formattedTime,
      location: "To be determined",
      structure: {
        groups: tournamentStructure.groups,
        participantsPerGroup: tournamentStructure.participantsPerGroup,
        knockoutRounds: tournamentStructure.knockoutRounds,
        seedingMethod,
      },
      participants: channelUsers.slice(0, participantCount).map((user) => ({
        userId: user.id,
        username: user.username,
        status: ParticipantStatus.PENDING,
        stats: {},
      })),
      statsConfig: {
        enabledStats: ["wins", "losses", "winRate"],
        customStats: [],
      },
    };

    onSubmit(tournamentData);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 8,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: 28,
          fontWeight: 600,
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "rgba(15, 23, 42, 0.95)",
          borderBottom: 1,
          borderColor: "divider",
          color: "white",
        }}
      >
        Create Structured Tournament
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Stack spacing={3}>
            <TextField
              label="Number of Participants"
              type="number"
              value={participantCount || ""}
              onChange={(e) => setParticipantCount(Number(e.target.value))}
              error={!!errors.participantCount}
              helperText={
                errors.participantCount || "Enter a number between 6 and 20"
              }
              fullWidth
              inputProps={{ min: 6, max: 20 }}
            />
            <Alert severity="info">
              The tournament structure will be automatically determined based on
              the number of participants.
            </Alert>
          </Stack>
        )}

        {activeStep === 1 && tournamentStructure && (
          <Stack spacing={3}>
            <Paper sx={{ p: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                Tournament Structure
              </Typography>
              <Typography sx={{ color: "white", whiteSpace: "pre-line" }}>
                {tournamentStructure.description}
              </Typography>
            </Paper>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: "white" }}>
                Seeding Method
              </FormLabel>
              <RadioGroup
                value={seedingMethod}
                onChange={(e) =>
                  setSeedingMethod(e.target.value as "ranking" | "random")
                }
              >
                <FormControlLabel
                  value="ranking"
                  control={<Radio />}
                  label="Based on ranking (strongest vs weakest)"
                  sx={{ color: "white" }}
                />
                <FormControlLabel
                  value="random"
                  control={<Radio />}
                  label="Random draw"
                  sx={{ color: "white" }}
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        )}

        {activeStep === 2 && tournamentStructure && (
          <Stack spacing={3}>
            <Paper sx={{ p: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                Final Details
              </Typography>
              <Typography sx={{ color: "white" }}>
                Number of Participants: {participantCount}
              </Typography>
              <Typography sx={{ color: "white" }}>
                Number of Groups: {tournamentStructure.groups}
              </Typography>
              <Typography sx={{ color: "white" }}>
                Participants per Group:{" "}
                {tournamentStructure.participantsPerGroup}
              </Typography>
              <Typography sx={{ color: "white" }}>
                Knockout Rounds: {tournamentStructure.knockoutRounds.join(", ")}
              </Typography>
              <Typography sx={{ color: "white" }}>
                Seeding Method:{" "}
                {seedingMethod === "ranking"
                  ? "Based on ranking"
                  : "Random draw"}
              </Typography>
            </Paper>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={handleClose} disabled={isCreating}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isCreating}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={isCreating}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            Create Tournament
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StructuredTournamentDialog;
