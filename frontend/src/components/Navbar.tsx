import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Features", path: "/features" },
    { label: "Contact", path: "/contact" },
  ];

  const NavButton = ({ label, path }: { label: string; path: string }) => (
    <Button
      component={RouterLink}
      to={path}
      sx={{
        color: "text.primary",
        mx: 1,
        "&:hover": {
          color: "primary.main",
        },
      }}
    >
      {label}
    </Button>
  );

  const MobileMenu = () => (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(30, 41, 59, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                fullWidth
                sx={{
                  color: "text.primary",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <RouterLink
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: theme.palette.primary.main,
              }}
            >
              LeagueLink
            </motion.div>
          </RouterLink>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <MobileMenu />
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {navItems.map((item) => (
              <NavButton key={item.path} label={item.label} path={item.path} />
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
