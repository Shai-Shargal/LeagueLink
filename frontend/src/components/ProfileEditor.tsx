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
} from "@mui/material";
import { authService } from "../services/api";

const SPORTS_EMOJIS = [
  "⚽", // Soccer
  "🏀", // Basketball
  "🏈", // Football
  "⚾", // Baseball
  "🏒", // Hockey
  "🎾", // Tennis
  "🏐", // Volleyball
  "🏓", // Table Tennis
  "🏸", // Badminton
  "🏊", // Swimming
  "🏃", // Running
  "🚴", // Cycling
  "🏋️", // Weightlifting
  "🥊", // Boxing
  "🥋", // Martial Arts
];

interface ProfileData {
  username: string;
  bio: string;
  favoriteSports: string[];
  profilePicture: string;
}

const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    bio: "",
    favoriteSports: [],
    profilePicture: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setProfile({
          username: userData.username,
          bio: userData.bio || "",
          favoriteSports: userData.favoriteSports || [],
          profilePicture: userData.profilePicture || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, bio: e.target.value });
  };

  const toggleSport = (sport: string) => {
    setProfile((prev) => ({
      ...prev,
      favoriteSports: prev.favoriteSports.includes(sport)
        ? prev.favoriteSports.filter((s) => s !== sport)
        : [...prev.favoriteSports, sport],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.updateProfile({
        bio: profile.bio,
        favoriteSports: profile.favoriteSports,
      });

      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(198, 128, 227, 0.2)",
        "&:hover": {
          border: "1px solid rgba(198, 128, 227, 0.4)",
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          background: "linear-gradient(45deg, #C680E3, #9333EA)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Edit Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={profile.profilePicture}
            sx={{
              width: 100,
              height: 100,
              border: "2px solid #C680E3",
            }}
          />
          <Typography variant="h6" sx={{ color: "#C680E3" }}>
            {profile.username}
          </Typography>
        </Box>

        <TextField
          label="Bio"
          multiline
          rows={4}
          value={profile.bio}
          onChange={handleBioChange}
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(198, 128, 227, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(198, 128, 227, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#C680E3",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#C680E3",
            },
          }}
        />

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#C680E3" }}>
            Favorite Sports
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {SPORTS_EMOJIS.map((sport) => (
              <Chip
                key={sport}
                label={sport}
                onClick={() => toggleSport(sport)}
                sx={{
                  backgroundColor: profile.favoriteSports.includes(sport)
                    ? "rgba(198, 128, 227, 0.2)"
                    : "rgba(30, 41, 59, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(198, 128, 227, 0.3)",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "linear-gradient(45deg, #C680E3, #9333EA)",
            "&:hover": {
              background: "linear-gradient(45deg, #9333EA, #7928CA)",
            },
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ProfileEditor;
