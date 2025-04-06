import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import Channels from "../ll-channels/Channels";
import ChannelView from "../ll-channels/ChannelView";

const DRAWER_WIDTH = 242;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{
    username: string;
    profilePicture: string;
  } | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const channelId = searchParams.get("channel");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)", // Subtract header height
        marginTop: "64px", // Add margin for header
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: DRAWER_WIDTH,
          height: "calc(100vh - 64px)",
          background: "#0f172a",
          borderRight: "1px solid rgba(198, 128, 227, 0.2)",
          overflow: "hidden",
        }}
      >
        <Channels />
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {channelId ? (
          <ChannelView channelId={channelId} />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #C680E3, #9333EA)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                marginBottom: "16px",
                fontSize: { xs: "2rem", md: "3rem" },
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Welcome {user.username}!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#dcddde",
                maxWidth: "600px",
                opacity: 0.9,
                fontSize: { xs: "1rem", md: "1.25rem" },
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Select a channel from the sidebar or create a new one to start
              connecting with your community.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
