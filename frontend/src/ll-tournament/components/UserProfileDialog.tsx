import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";

const SPORTS_EMOJIS: { emoji: string; name: string }[] = [
  { emoji: "⚽", name: "Soccer" },
  { emoji: "🏀", name: "Basketball" },
  { emoji: "🏈", name: "Football" },
  { emoji: "⚾", name: "Baseball" },
  { emoji: "🏒", name: "Hockey" },
  { emoji: "🎾", name: "Tennis" },
  { emoji: "🏐", name: "Volleyball" },
  { emoji: "🏓", name: "Table Tennis" },
  { emoji: "🏸", name: "Badminton" },
  { emoji: "🏊", name: "Swimming" },
  { emoji: "🏃", name: "Running" },
  { emoji: "🚴", name: "Cycling" },
  { emoji: "🏋️", name: "Weightlifting" },
  { emoji: "🥊", name: "Boxing" },
  { emoji: "🥋", name: "Martial Arts" },
];

interface UserProfileData {
  username: string;
  bio: string;
  favoriteSports: string[];
  profilePicture?: string;
}

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserProfileData | null;
  loading: boolean;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onClose,
  user,
  loading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          color: "white",
          minWidth: 300,
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid rgba(198, 128, 227, 0.2)" }}>
        {loading ? (
          <CircularProgress size={20} sx={{ color: "#C680E3" }} />
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user?.profilePicture}
              sx={{
                width: 50,
                height: 50,
                bgcolor: "rgba(198, 128, 227, 0.2)",
                border: "2px solid rgba(198, 128, 227, 0.3)",
              }}
            >
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{user?.username}</Typography>
          </Box>
        )}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress sx={{ color: "#C680E3" }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
              >
                Bio
              </Typography>
              <Typography>{user?.bio || "No bio available"}</Typography>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
              >
                Favorite Sports
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {user?.favoriteSports?.map((sport) => {
                  const sportInfo = SPORTS_EMOJIS.find(
                    (s) => s.emoji === sport
                  );
                  return sportInfo ? (
                    <Tooltip key={sport} title={sportInfo.name} arrow>
                      <Chip
                        label={`${sport} ${sportInfo.name}`}
                        sx={{
                          backgroundColor: "rgba(198, 128, 227, 0.2)",
                          color: "#C680E3",
                          border: "1px solid rgba(198, 128, 227, 0.3)",
                        }}
                      />
                    </Tooltip>
                  ) : null;
                })}
                {(!user?.favoriteSports ||
                  user.favoriteSports.length === 0) && (
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                  >
                    No favorite sports added
                  </Typography>
                )}
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid rgba(198, 128, 227, 0.2)" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#C680E3",
            "&:hover": {
              backgroundColor: "rgba(198, 128, 227, 0.1)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;
