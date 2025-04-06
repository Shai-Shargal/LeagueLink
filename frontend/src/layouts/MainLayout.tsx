import React from "react";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { motion } from "framer-motion";
import { theme } from "../themes/theme";
import Navbar from "../ll-dashboard/Navbar";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isEditProfile = location.pathname.includes("/editprofile");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          position: "relative",
          overflow: isEditProfile ? "visible" : "hidden",
          display: "flex",
          flexDirection: "column",
          paddingTop: isEditProfile ? "0" : "64px",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ flex: 1, position: "relative" }}
        >
          <Navbar />
          <Container
            maxWidth={false}
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "100%",
              margin: 0,
              ...(isEditProfile
                ? {
                    marginTop: "80px",
                    height: "auto",
                    overflow: "visible",
                    padding: "24px",
                  }
                : {
                    marginTop: 0,
                    height: "calc(100vh - 64px)",
                    overflow: "auto",
                    maxWidth: "100%",
                    padding: "16px",
                    boxSizing: "border-box",
                  }),
            }}
          >
            {children}
          </Container>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
