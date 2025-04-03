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
import Channels from "../ll-channels/Channels";
import ChannelView from "../ll-channels/ChannelView";
import { EmojiEvents, People, SportsScore } from "@mui/icons-material";

const DRAWER_WIDTH = 242;

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
        background: "#0f172a",
        position: "relative",
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
            background: "#0f172a",
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
          height: "944px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          marginLeft: `${DRAWER_WIDTH}px`,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {searchParams.get("channel") ? (
          <Box
            sx={{
              width: "1677px",
              height: "878px",
              position: "fixed",
              top: "66px",
              left: "242px",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              margin: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(198, 128, 227, 0.05) 0%, transparent 70%)",
                pointerEvents: "none",
              },
            }}
          >
            <ChannelView channelId={searchParams.get("channel") || ""} />
          </Box>
        ) : (
          <Box
            sx={{
              width: "1677px",
              height: "878px",
              margin: 0,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              position: "fixed",
              top: "66px",
              left: "242px",
              background: "#0f172a",
            }}
          >
            {/* Welcome Section */}
            <Box
              sx={{
                textAlign: "center",
                position: "relative",
                marginBottom: "24px",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -10,
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
                  marginBottom: "16px",
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
                  padding: "32px",
                  background: "rgba(15, 23, 42, 0.7)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(198, 128, 227, 0.2)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                <ProfileEditor />
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mt: 0 }}>
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
                        padding: "32px",
                        background: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(198, 128, 227, 0.2)",
                        borderRadius: "12px",
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
                            padding: "16px",
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
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
