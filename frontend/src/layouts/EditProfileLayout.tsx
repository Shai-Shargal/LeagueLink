import React from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "../themes/theme";
import Navbar from "../ll-dashboard/Navbar";

interface EditProfileLayoutProps {
  children: React.ReactNode;
}

const EditProfileLayout: React.FC<EditProfileLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />

        {/* Main content */}
        <Box>
          <Navbar />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              padding: "24px",
              marginTop: "66px", // Height of the navbar
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditProfileLayout;
