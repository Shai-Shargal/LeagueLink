import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Container,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard"); // Redirect to dashboard after successful registration
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                variant="outlined"
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
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
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
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
                name="password"
                type="password"
                variant="outlined"
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
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
                name="confirmPassword"
                type="password"
                variant="outlined"
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
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
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  background: "linear-gradient(45deg, #C680E3, #9333EA)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #9333EA, #7928CA)",
                  },
                }}
              >
                {loading ? "Creating Account..." : "Register"}
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
