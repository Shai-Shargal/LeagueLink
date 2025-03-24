import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    console.log("Logging out...");
    authService.logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 700,
            background: "linear-gradient(45deg, #C680E3, #9333EA)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Hello {user.username}, welcome to LeagueLink!
        </Typography>

        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            background: "linear-gradient(45deg, #C680E3, #9333EA)",
            "&:hover": {
              background: "linear-gradient(45deg, #9333EA, #7928CA)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;
