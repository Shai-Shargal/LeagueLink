import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <Grid
        container
        spacing={4}
        alignItems="center"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                mb: 2,
                background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Connect with Your League Community
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                mb: 4,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              The ultimate platform for league players to connect, share, and
              grow together.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  },
                }}
              >
                Get Started
              </Button>
              <Button
                component={RouterLink}
                to="/features"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    color: "primary.dark",
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "relative",
              padding: "2rem",
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                left: -20,
                right: -20,
                bottom: -20,
                background:
                  "radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
                borderRadius: "32px",
                zIndex: -1,
              }}
            />
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Why Choose LeagueLink?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                "Connect with players from your region",
                "Share strategies and tips",
                "Find teammates for ranked games",
                "Track your progress and achievements",
                "Join vibrant community discussions",
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "text.secondary",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                      }}
                    />
                    {feature}
                  </Typography>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSection;
