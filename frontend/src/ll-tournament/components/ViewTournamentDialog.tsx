import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { Tournament } from "../types";

interface ViewTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: Tournament;
}

const DIALOG_WIDTH = 1200;
const DIALOG_HEIGHT = 800;
const GAMES_AREA_HEIGHT = 600;
const BASE_BOX_HEIGHT = 100;
const BASE_BOX_WIDTH = 200;
const MATCH_VERTICAL_GAP = 16;
const ROUND_HORIZONTAL_GAP = 60;
const INITIAL_TOP_MARGIN = 40;

const ViewTournamentDialog: React.FC<ViewTournamentDialogProps> = ({
  open,
  onClose,
  tournament,
}) => {
  // Group matches by round
  const matchesByRound =
    tournament.matches?.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {} as { [key: number]: typeof tournament.matches }) || {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: DIALOG_WIDTH,
          height: DIALOG_HEIGHT,
          borderRadius: 3,
          boxShadow: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: "1rem",
          padding: "8px 16px",
          minHeight: "auto",
          fontWeight: 500,
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: (theme) => theme.palette.background.paper,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {tournament.name}
      </DialogTitle>
      <DialogContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          p: 2,
          overflowY: "auto",
          background: (theme) => theme.palette.background.paper,
          "&.MuiDialogContent-root": {
            paddingTop: "16px",
          },
        }}
      >
        {/* Tournament Info */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Typography variant="body1">
            <strong>Date:</strong> {tournament.date}
          </Typography>
          <Typography variant="body1">
            <strong>Time:</strong> {tournament.time}
          </Typography>
          <Typography variant="body1">
            <strong>Location:</strong> {tournament.location}
          </Typography>
        </Box>

        {/* Matches Display */}
        <Paper
          sx={{
            flex: 7,
            minWidth: 0,
            height: GAMES_AREA_HEIGHT,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            background: "#1a2234",
            color: "text.secondary",
            mr: 2,
            overflowY: "auto",
            overflowX: "auto",
            p: 2,
            position: "relative",
          }}
          elevation={0}
        >
          <Box
            sx={{
              display: "flex",
              gap: ROUND_HORIZONTAL_GAP,
              p: 2,
              minWidth: "fit-content",
              mt: `${INITIAL_TOP_MARGIN}px`,
            }}
          >
            {Object.entries(matchesByRound).map(([round, roundMatches]) => (
              <Box
                key={round}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: MATCH_VERTICAL_GAP,
                  alignItems: "flex-start",
                }}
              >
                {roundMatches.map((match) => (
                  <Paper
                    key={match.id}
                    elevation={1}
                    sx={{
                      width: BASE_BOX_WIDTH,
                      height: BASE_BOX_HEIGHT,
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#242b3d",
                      borderRadius: 1,
                      position: "relative",
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: -ROUND_HORIZONTAL_GAP,
                        top: "50%",
                        width: ROUND_HORIZONTAL_GAP,
                        height: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        height: "50%",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {match.team1?.username || "TBD"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        height: "50%",
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {match.team2?.username || "TBD"}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTournamentDialog;
