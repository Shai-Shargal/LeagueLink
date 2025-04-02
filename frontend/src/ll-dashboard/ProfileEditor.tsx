import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { uploadService } from "../services/api";
import ImageUpload from "../components/ImageUpload";

const SPORTS_EMOJIS = [
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

interface ProfileData {
  username: string;
  bio: string;
  favoriteSports: string[];
  profilePicture: string;
}

const ProfileEditor: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    username: string;
    email: string;
    bio: string;
    favoriteSports: string[];
    profilePicture: string;
  } | null>(null);
  const [newSport, setNewSport] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await authService.updateProfile({
        bio: user.bio,
        favoriteSports: user.favoriteSports,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSport = () => {
    if (newSport && user) {
      setUser({
        ...user,
        favoriteSports: [...user.favoriteSports, newSport],
      });
      setNewSport("");
    }
  };

  const handleRemoveSport = (sport: string) => {
    if (user) {
      setUser({
        ...user,
        favoriteSports: user.favoriteSports.filter((s) => s !== sport),
      });
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      console.log("Starting profile picture upload...");
      const imageUrl = await uploadService.uploadProfilePicture(file);
      console.log("Upload successful, URL:", imageUrl);

      // Refresh user data to get the updated profile picture
      await fetchUser();

      console.log("User data refreshed");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    }
  };

  const handleProfilePictureDelete = async () => {
    if (!user?.profilePicture) return;
    try {
      console.log("Deleting profile picture...");
      await uploadService.deleteProfilePicture(user.profilePicture);

      // Refresh user data to get the updated state
      await fetchUser();

      console.log("Profile picture deleted and user data refreshed");
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      alert("Failed to delete profile picture. Please try again.");
    }
  };

  const handleEmojiClick = (sport: { emoji: string; name: string }) => {
    if (user && !user.favoriteSports.includes(sport.emoji)) {
      setUser({
        ...user,
        favoriteSports: [...user.favoriteSports, sport.emoji],
      });
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Paper
      sx={{
        p: 4,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: 3,
        border: "1px solid rgba(198, 128, 227, 0.2)",
      }}
    >
      <Stack spacing={4}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <ImageUpload
            currentImage={user.profilePicture}
            onUpload={handleProfilePictureUpload}
            onDelete={handleProfilePictureDelete}
            size={200}
          />
        </Box>

        <TextField
          label="Username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(198, 128, 227, 0.4)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(198, 128, 227, 0.6)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#C680E3",
              },
              color: "#fff",
            },
            "& .MuiInputLabel-root": {
              color: "rgba(198, 128, 227, 0.7)",
              "&.Mui-focused": {
                color: "#C680E3",
              },
            },
          }}
        />

        <TextField
          label="Email"
          value={user.email}
          disabled
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(198, 128, 227, 0.4)",
              },
              color: "#fff",
            },
            "& .MuiInputLabel-root": {
              color: "rgba(198, 128, 227, 0.7)",
            },
          }}
        />

        <TextField
          label="Bio"
          value={user.bio}
          onChange={(e) => setUser({ ...user, bio: e.target.value })}
          multiline
          rows={4}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(198, 128, 227, 0.4)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(198, 128, 227, 0.6)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#C680E3",
              },
              color: "#fff",
            },
            "& .MuiInputLabel-root": {
              color: "rgba(198, 128, 227, 0.7)",
              "&.Mui-focused": {
                color: "#C680E3",
              },
            },
          }}
        />

        <Box>
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
            Favorite Sports
          </Typography>

          {/* Emoji Picker Grid */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(198, 128, 227, 0.2)",
            }}
          >
            <Grid container spacing={1}>
              {SPORTS_EMOJIS.map((sport) => (
                <Grid item key={sport.emoji}>
                  <Tooltip title={sport.name} arrow>
                    <IconButton
                      onClick={() => handleEmojiClick(sport)}
                      sx={{
                        fontSize: "1.8rem",
                        color: "#fff",
                        transition: "all 0.2s ease",
                        backgroundColor: user?.favoriteSports.includes(
                          sport.emoji
                        )
                          ? "rgba(15, 23, 42, 0.8)"
                          : "transparent",
                        boxShadow: user?.favoriteSports.includes(sport.emoji)
                          ? "0 0 10px rgba(198, 128, 227, 0.3)"
                          : "none",
                        "&:hover": {
                          backgroundColor: user?.favoriteSports.includes(
                            sport.emoji
                          )
                            ? "rgba(15, 23, 42, 0.8)"
                            : "rgba(198, 128, 227, 0.1)",
                        },
                      }}
                    >
                      {sport.emoji}
                    </IconButton>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Selected Sports Chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {user.favoriteSports.map((sport) => {
              const sportInfo = SPORTS_EMOJIS.find((s) => s.emoji === sport);
              return (
                <Chip
                  key={sport}
                  label={`${sport} ${sportInfo?.name || ""}`}
                  onDelete={() => handleRemoveSport(sport)}
                  sx={{
                    backgroundColor: "rgba(198, 128, 227, 0.2)",
                    color: "#C680E3",
                    "& .MuiChip-deleteIcon": {
                      color: "#C680E3",
                      "&:hover": {
                        color: "#9333EA",
                      },
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/dashboard")}
            sx={{
              color: "#C680E3",
              borderColor: "rgba(198, 128, 227, 0.4)",
              "&:hover": {
                borderColor: "#C680E3",
                backgroundColor: "rgba(198, 128, 227, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              backgroundColor: "#C680E3",
              "&:hover": {
                backgroundColor: "#9333EA",
              },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProfileEditor;
