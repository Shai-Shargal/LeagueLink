import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Drawer,
  Grid,
  Paper,
  Stack,
  useTheme,
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
  const theme = useTheme();

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
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(198, 128, 227, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
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
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
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
          <Box
            sx={{
              mb: isEditing ? 4 : 6,
              textAlign: "center",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -20,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100px",
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #C680E3, transparent)",
                borderRadius: "2px",
              },
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
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
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
                p: 4,
                background: "rgba(15, 23, 42, 0.7)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                border: "1px solid rgba(198, 128, 227, 0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <ProfileEditor />
            </Box>
          ) : (
            <>
              {/* Quick Stats */}
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {[
                  {
                    icon: (
                      <EmojiEvents sx={{ fontSize: 40, color: "#C680E3" }} />
                    ),
                    title: "Active Tournaments",
                    value: "0",
                  },
                  {
                    icon: <People sx={{ fontSize: 40, color: "#C680E3" }} />,
                    title: "Team Members",
                    value: "0",
                  },
                  {
                    icon: (
                      <SportsScore sx={{ fontSize: 40, color: "#C680E3" }} />
                    ),
                    title: "Win Rate",
                    value: "0%",
                  },
                ].map((stat, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        background: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(198, 128, 227, 0.2)",
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          border: "1px solid rgba(198, 128, 227, 0.4)",
                          boxShadow: "0 8px 30px rgba(198, 128, 227, 0.1)",
                        },
                        minHeight: "200px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Stack
                        spacing={3}
                        alignItems="center"
                        sx={{ width: "100%" }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "50%",
                            background: "rgba(198, 128, 227, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#fff",
                            fontWeight: 500,
                            textAlign: "center",
                          }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            color: "#C680E3",
                            fontWeight: "bold",
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
