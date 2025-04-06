import React, { useState, useEffect } from "react";
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setMobileOpen(false);
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const publicNavItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "#about", action: () => scrollToSection("about") },
    { label: "Features", path: "/features" },
    {
      label: "Contact",
      path: "#contact",
      action: () => scrollToSection("contact"),
    },
  ];

  const authenticatedNavItems = [
    { label: "Edit Profile", path: "/dashboard/editprofile" },
    { label: "Logout", action: handleLogout },
  ];

  // Only show nav items if we're not on the login or register pages
  const currentPath = location.pathname;
  const isAuthPage = currentPath === "/login" || currentPath === "/register";
  const navItems =
    isAuthenticated && !isAuthPage ? authenticatedNavItems : publicNavItems;

  const NavButton = ({
    label,
    path,
    action,
  }: {
    label: string;
    path?: string;
    action?: () => void;
  }) => (
    <Button
      component={action ? "button" : RouterLink}
      to={!action ? path : undefined}
      onClick={action}
      sx={{
        color: "text.primary",
        mx: 1,
        "&:hover": {
          color: "#C680E3",
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
            borderBottom: "1px solid rgba(198, 128, 227, 0.2)",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path || item.label}
                component={item.action ? "button" : RouterLink}
                to={!item.action ? item.path : undefined}
                onClick={item.action}
                fullWidth
                sx={{
                  color: "text.primary",
                  "&:hover": {
                    color: "#C680E3",
                    backgroundColor: "rgba(198, 128, 227, 0.1)",
                  },
                }}
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
      position="fixed"
      sx={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(198, 128, 227, 0.2)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <EmojiEventsIcon sx={{ color: "#C680E3", fontSize: "2rem" }} />
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#C680E3",
                }}
              >
                LeagueLink
              </span>
            </motion.div>
          </Box>
        </Box>

        {!isAuthPage &&
          (isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{
                  ml: 2,
                  "&:hover": {
                    color: "#C680E3",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <MobileMenu />
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {navItems.map((item) => (
                <NavButton
                  key={item.path || item.label}
                  label={item.label}
                  path={item.path}
                  action={item.action}
                />
              ))}
            </Box>
          ))}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
