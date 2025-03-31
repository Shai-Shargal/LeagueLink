import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Drawer } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import ProfileEditor from "./ProfileEditor";
import Channels from "./Channels";

const DRAWER_WIDTH = 240;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{
    username: string;
    profilePicture: string;
  } | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      console.log("Fetching user data...");
      const userData = await authService.getCurrentUser();
      console.log("User data received:", userData);
      if (userData) {
        setUser(userData);
      } else {
        console.log("No user data, redirecting to login");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const isEditing = searchParams.get("edit") === "true";

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            background: "#1e1f22",
            borderRight: "1px solid rgba(198, 128, 227, 0.2)",
          },
        }}
      >
        <Channels />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#313338",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #C680E3, #9333EA)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Hello {user.username}, welcome to LeagueLink!
          </Typography>

          {isEditing ? (
            <ProfileEditor />
          ) : (
            <Typography variant="body1" sx={{ color: "#dcddde" }}>
              Select a channel from the sidebar to start chatting!
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
