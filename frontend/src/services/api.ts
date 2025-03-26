import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Updated to match backend port

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  bio?: string;
  favoriteSports?: string[];
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post("/users/register", data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      console.log("Token stored after registration:", response.data.data.token);
    }
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post("/users/login", data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      console.log("Token stored after login:", response.data.data.token);
      // Add the token to axios default headers
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.data.token}`;
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    console.log("Token removed after logout");
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found for getCurrentUser");
      return null;
    }

    try {
      const response = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Current user data:", response.data);
      return response.data.data; // Extract the user data from the nested structure
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.put("/users/profile", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default api;
