import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import Channels from "../ll-channels/Channels";
import ChannelView from "../ll-channels/ChannelView";
import ViewTournamentInChannel from "../ll-tournament/components/ViewTournamentInChannel";

const DRAWER_WIDTH = 242;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{
    username: string;
    profilePicture: string;
  } | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const channelId = searchParams.get("channel");
  const view = searchParams.get("view");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      console.log("Fetching current user...");
      const userData = await authService.getCurrentUser();
      console.log("User data:", userData);
      if (userData) {
        setUser(userData);
      } else {
        console.log("No user data found, redirecting to login");
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

  const renderContent = () => {
    if (view === "tournaments" && channelId) {
      return <ViewTournamentInChannel />;
    }
    if (channelId) {
      return <ChannelView channelId={channelId} />;
    }
    return (
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
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        paddingTop: "64px",
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
          position: "fixed",
          top: "64px",
          left: 0,
          zIndex: 1,
        }}
      >
        <Channels />
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          marginLeft: `${DRAWER_WIDTH}px`,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
