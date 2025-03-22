import React from "react";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { motion } from "framer-motion";
import { theme } from "../themes/theme";
import Navbar from "../components/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar />
          <Container
            maxWidth="lg"
            sx={{
              position: "relative",
              zIndex: 1,
              py: 4,
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
