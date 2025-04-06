import React from "react";
import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: "Create Tournaments",
      description: "Organize and manage tournaments for any sport or game",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: "Build Teams",
      description: "Find players and form competitive teams",
    },
    {
      icon: <SportsEsportsIcon sx={{ fontSize: 40 }} />,
      title: "Compete & Win",
      description: "Participate in tournaments and climb the rankings",
    },
  ];

  return (
    <Box
      sx={{
        pt: { xs: 4, md: 8 },
        pb: { xs: 6, md: 12 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C680E3' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          opacity: 0.8,
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  fontWeight: "bold",
                  mb: 2,
                  background: "linear-gradient(45deg, #C680E3, #9333EA)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Create & Join Tournaments
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  color: "text.secondary",
                  mb: 4,
                }}
              >
                Your Ultimate Platform for Sports & Gaming Competitions
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    background: "linear-gradient(45deg, #C680E3, #9333EA)",
                    px: 4,
                    "&:hover": {
                      background: "linear-gradient(45deg, #9333EA, #7928CA)",
                    },
                  }}
                >
                  Register Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 4,
                    borderColor: "#C680E3",
                    color: "#C680E3",
                    "&:hover": {
                      borderColor: "#9333EA",
                      color: "#9333EA",
                      backgroundColor: "rgba(198, 128, 227, 0.1)",
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      background: "rgba(30, 41, 59, 0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(198, 128, 227, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        border: "1px solid rgba(198, 128, 227, 0.4)",
                      },
                    }}
                  >
                    <Box sx={{ color: "#C680E3" }}>{feature.icon}</Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
