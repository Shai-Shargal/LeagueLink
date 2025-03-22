import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { VoiceChat, Groups, FreeBreakfast } from "@mui/icons-material";

const features = [
  {
    icon: <VoiceChat sx={{ fontSize: 40 }} />,
    title: "High-quality Voice",
    description:
      "Crystal-clear voice, video, and text communication with no lag.",
  },
  {
    icon: <Groups sx={{ fontSize: 40 }} />,
    title: "Community",
    description: "Join millions of people in any server, or create your own.",
  },
  {
    icon: <FreeBreakfast sx={{ fontSize: 40 }} />,
    title: "Free Forever",
    description:
      "LeagueLink is free and always will be, with no ads or premium-only features.",
  },
];

const Body: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
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
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Box
                  sx={{
                    color: "primary.main",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Body;
