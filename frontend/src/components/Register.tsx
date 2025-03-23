import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add registration logic here
    console.log("Register:", { username, password, confirmPassword });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)", // Account for navbar height
          display: "flex",
          alignItems: "center",
          py: 8,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(198, 128, 227, 0.2)",
              "&:hover": {
                border: "1px solid rgba(198, 128, 227, 0.4)",
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                mb: 4,
                fontWeight: 700,
                background: "linear-gradient(45deg, #C680E3, #9333EA)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Create Account
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(198, 128, 227, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(198, 128, 227, 0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#C680E3",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#C680E3",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(198, 128, 227, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(198, 128, 227, 0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#C680E3",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#C680E3",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(198, 128, 227, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(198, 128, 227, 0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#C680E3",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#C680E3",
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  background: "linear-gradient(45deg, #C680E3, #9333EA)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #9333EA, #7928CA)",
                  },
                }}
              >
                Register
              </Button>
            </form>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#C680E3",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Register;
