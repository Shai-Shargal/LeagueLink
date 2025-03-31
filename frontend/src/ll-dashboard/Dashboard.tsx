import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Drawer,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import ProfileEditor from "./ProfileEditor";
import Channels from "./Channels";
import { EmojiEvents, People, SportsScore } from "@mui/icons-material";

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
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(135deg, #1a1b1e 0%, #2d2f35 100%)",
      }}
    >
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
          height: "100vh",
          p: 0,
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
            display: "none",
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: "100%",
            p: 3,
            pb: 6,
          }}
        >
          {/* Welcome Section */}
          <Box sx={{ mb: isEditing ? 4 : 6, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #C680E3, #9333EA)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Hello {user.username}, welcome to LeagueLink!
            </Typography>
            {!isEditing && (
              <Typography
                variant="h6"
                sx={{
                  color: "#dcddde",
                  maxWidth: 800,
                  margin: "0 auto",
                  opacity: 0.9,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                Your ultimate platform for connecting gamers, organizing
                tournaments, and building competitive communities.
              </Typography>
            )}
          </Box>

          {isEditing ? (
            <Box
              sx={{
                width: "100%",
                maxWidth: 800,
                margin: "0 auto",
                p: 3,
                background: "rgba(30, 41, 59, 0.7)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                border: "1px solid rgba(198, 128, 227, 0.2)",
              }}
            >
              <ProfileEditor />
            </Box>
          ) : (
            <>
              {/* Quick Stats */}
              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      background: "rgba(30, 41, 59, 0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(198, 128, 227, 0.2)",
                      "&:hover": {
                        border: "1px solid rgba(198, 128, 227, 0.4)",
                      },
                      minHeight: "200px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Stack
                      spacing={2}
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <EmojiEvents sx={{ fontSize: 40, color: "#C680E3" }} />
                      <Typography variant="h6" sx={{ color: "#fff" }}>
                        Active Tournaments
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: "#C680E3", fontWeight: "bold" }}
                      >
                        0
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      background: "rgba(30, 41, 59, 0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(198, 128, 227, 0.2)",
                      "&:hover": {
                        border: "1px solid rgba(198, 128, 227, 0.4)",
                      },
                      minHeight: "200px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Stack
                      spacing={2}
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <People sx={{ fontSize: 40, color: "#C680E3" }} />
                      <Typography variant="h6" sx={{ color: "#fff" }}>
                        Team Members
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: "#C680E3", fontWeight: "bold" }}
                      >
                        0
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      background: "rgba(30, 41, 59, 0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(198, 128, 227, 0.2)",
                      "&:hover": {
                        border: "1px solid rgba(198, 128, 227, 0.4)",
                      },
                      minHeight: "200px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Stack
                      spacing={2}
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <SportsScore sx={{ fontSize: 40, color: "#C680E3" }} />
                      <Typography variant="h6" sx={{ color: "#fff" }}>
                        Win Rate
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: "#C680E3", fontWeight: "bold" }}
                      >
                        0%
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
