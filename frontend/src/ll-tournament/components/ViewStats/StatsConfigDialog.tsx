import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
} from "@mui/material";
import { Tournament, TournamentStatsConfig } from "../../types";

interface StatsConfigDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onUpdateConfig: (tournamentId: string, config: TournamentStatsConfig) => void;
}

const defaultStatsConfig: TournamentStatsConfig = {
  enabledStats: ["wins", "losses", "winRate"],
  customStats: [],
};

const StatsConfigDialog: React.FC<StatsConfigDialogProps> = ({
  open,
  onClose,
  tournament,
  onUpdateConfig,
}) => {
  if (!tournament) return null;

  const statsConfig = tournament.statsConfig || defaultStatsConfig;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configure Tournament Statistics</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2, minWidth: 300 }}>
          <Typography variant="subtitle1">Default Statistics</Typography>
          {["wins", "losses", "winRate"].map((stat) => (
            <FormControlLabel
              key={stat}
              control={
                <Checkbox
                  checked={statsConfig.enabledStats.includes(stat)}
                  onChange={(e) => {
                    const newConfig = {
                      ...statsConfig,
                      enabledStats: e.target.checked
                        ? [...statsConfig.enabledStats, stat]
                        : statsConfig.enabledStats.filter(
                            (s: string) => s !== stat
                          ),
                    };
                    onUpdateConfig(tournament.id, newConfig);
                  }}
                />
              }
              label={stat}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatsConfigDialog;
