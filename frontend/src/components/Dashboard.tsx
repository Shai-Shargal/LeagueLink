import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import ProfileEditor from "./ProfileEditor";

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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              Use the navigation bar above to edit your profile or log out.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
