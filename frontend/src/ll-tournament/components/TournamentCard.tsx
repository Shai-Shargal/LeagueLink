import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Stack,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  EmojiEvents as TrophyIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  SportsTennis as SportsIcon,
} from "@mui/icons-material";

interface TournamentCardProps {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  createdBy?: {
    username: string;
    profilePicture?: string;
  };
  participantsCount?: number;
  status?: "upcoming" | "in_progress" | "completed";
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  name,
  description,
  date,
  time,
  location,
  createdBy,
  participantsCount = 0,
  status = "upcoming",
}) => {
  // פונקציה לקבלת צבע סטטוס
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          bg: "rgba(76, 175, 80, 0.1)",
          color: "#4CAF50",
          border: "rgba(76, 175, 80, 0.3)",
        };
      case "in_progress":
        return {
          bg: "rgba(255, 152, 0, 0.1)",
          color: "#FF9800",
          border: "rgba(255, 152, 0, 0.3)",
        };
      case "completed":
        return {
          bg: "rgba(33, 150, 243, 0.1)",
          color: "#2196F3",
          border: "rgba(33, 150, 243, 0.3)",
        };
      default:
        return {
          bg: "rgba(76, 175, 80, 0.1)",
          color: "#4CAF50",
          border: "rgba(76, 175, 80, 0.3)",
        };
    }
  };

  const statusStyle = getStatusColor(status);

  return (
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          backgroundColor: "#1f1f1f",
        },
        border: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Status Indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 50px 50px 0",
          borderColor: `transparent ${statusStyle.color} transparent transparent`,
          opacity: 0.2,
        }}
      />

      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrophyIcon sx={{ color: "#FFD700", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {name}
            </Typography>
          </Box>
          <IconButton size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Creator Info */}
        {createdBy && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Avatar
              src={createdBy.profilePicture}
              sx={{ width: 24, height: 24 }}
            >
              {createdBy.username[0]}
            </Avatar>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Created by {createdBy.username}
            </Typography>
          </Box>
        )}

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        {/* Details Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Stack spacing={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {date}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TimeIcon sx={{ color: "#2196F3", fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {time}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationIcon sx={{ color: "#F44336", fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {location}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon sx={{ color: "#9C27B0", fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {participantsCount} Participants
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Status and Action Chips */}
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size="small"
            sx={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
            }}
          />
          <Chip
            icon={<SportsIcon />}
            label="View Matches"
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;
