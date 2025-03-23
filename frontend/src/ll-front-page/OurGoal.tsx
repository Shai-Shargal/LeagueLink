import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { EmojiEvents, Groups, SportsSoccer, Chat } from "@mui/icons-material";

const goals = [
  {
    icon: <EmojiEvents sx={{ fontSize: 40 }} />,
    title: "Tournament Management",
    description:
      "Create and manage tournaments with customizable rules, brackets, and scoring systems.",
  },
  {
    icon: <Groups sx={{ fontSize: 40 }} />,
    title: "Community Building",
    description:
      "Connect with players, form teams, and build thriving sports communities.",
  },
  {
    icon: <SportsSoccer sx={{ fontSize: 40 }} />,
    title: "Match Tracking",
    description:
      "Track match results, maintain statistics, and monitor player performance.",
  },
  {
    icon: <Chat sx={{ fontSize: 40 }} />,
    title: "Real-time Communication",
    description:
      "Coordinate games, discuss strategies, and stay connected with your team.",
  },
];

const OurGoal: React.FC = () => {
  return (
    <Box sx={{ py: 8, position: "relative" }} data-section="about">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            mb: 6,
            fontWeight: 700,
            background: "linear-gradient(45deg, #C680E3, #9333EA)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Our Mission
        </Typography>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 8,
            color: "text.secondary",
            maxWidth: "800px",
            mx: "auto",
            px: 2,
          }}
        >
          We're building the ultimate platform for sports communities to
          connect, compete, and grow together. Whether you're organizing a local
          tournament or managing a professional league, LeagueLink has you
          covered.
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        {goals.map((goal, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  background: "rgba(30, 41, 59, 0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(198, 128, 227, 0.2)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    border: "1px solid rgba(198, 128, 227, 0.4)",
                    boxShadow: "0 4px 20px rgba(198, 128, 227, 0.15)",
                  },
                }}
              >
                <Box
                  sx={{
                    color: "#C680E3",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {goal.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {goal.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  {goal.description}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OurGoal;
