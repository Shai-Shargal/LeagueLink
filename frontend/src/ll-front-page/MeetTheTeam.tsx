import React from "react";
import { Box, Typography, Avatar, Paper, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { GitHub, LinkedIn, Email } from "@mui/icons-material";
import shaiShargalPic from "../assets/ShaiSharglPicture.svg";

const teamMembers = [
  {
    name: "Shai Shargal",
    role: "Full Stack Developer",
    image: shaiShargalPic,
    bio: "Passionate about creating seamless sports community experiences and building scalable web applications.",
    social: {
      github: "https://github.com/Shai-Shargal",
      linkedin: "https://www.linkedin.com/in/shai-shargal-5057991bb",
      email: "shai.shargal@gmail.com",
    },
  },
  // Add more team members here as needed
];

const MeetTheTeam: React.FC = () => {
  return (
    <Box sx={{ py: 8, position: "relative" }} data-section="contact">
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
            background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Meet the Team
        </Typography>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 8,
            color: "text.secondary",
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          We're a passionate team dedicated to revolutionizing how sports
          communities connect and compete.
        </Typography>
      </motion.div>

      <Grid container spacing={4} justifyContent="center">
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Avatar
                    src={member.image}
                    alt={member.name}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      border: "3px solid",
                      borderColor: "primary.main",
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    {member.role}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      textAlign: "center",
                      mb: 3,
                    }}
                  >
                    {member.bio}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <motion.a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GitHub
                        sx={{
                          color: "text.primary",
                          "&:hover": { color: "primary.main" },
                        }}
                      />
                    </motion.a>
                    <motion.a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LinkedIn
                        sx={{
                          color: "text.primary",
                          "&:hover": { color: "primary.main" },
                        }}
                      />
                    </motion.a>
                    <motion.a
                      href={`mailto:${member.social.email}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Email
                        sx={{
                          color: "text.primary",
                          "&:hover": { color: "primary.main" },
                        }}
                      />
                    </motion.a>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MeetTheTeam;
