import axios from "axios";
import { firebaseStorage } from "./firebase.service";

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

interface ChannelData {
  name: string;
  description: string;
  passcode: string;
  image?: string;
}

interface JoinChannelData {
  channelName: string;
  passcode: string;
}

interface UpdateChannelData {
  description?: string;
  image?: string;
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
      const token = response.data.data.token;
      localStorage.setItem("token", token);
      console.log("Token stored after login:", token);
      // Add the token to axios default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return response.data;
  },

  logout: async () => {
    try {
      // Get the current token
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found during logout");
        return;
      }

      // Make API call to logout endpoint
      await api.post(
        "/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear all auth-related data
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      // Reset axios instance to its initial state
      api.defaults.headers.common = {
        "Content-Type": "application/json",
      };

      console.log("Successfully logged out and cleared all auth data");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still remove the token even if there's an error
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
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
      console.log("Raw response from getCurrentUser:", response);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // This should contain the user object with _id
      }
      return null;
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

  getUserProfile: async (username: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get(`/users/profile/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.delete("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Channel methods
  getMyChannels: async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);

      const response = await api.get("/channels/my-channels", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Raw getMyChannels response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getMyChannels:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  },

  createChannel: async (data: ChannelData) => {
    const response = await axios.post(`${API_URL}/channels`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  joinChannel: async (data: JoinChannelData) => {
    const response = await api.post("/channels/join", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  updateChannel: async (channelId: string, data: UpdateChannelData) => {
    const response = await api.put(`/channels/${channelId}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  deleteChannel: async (channelId: string) => {
    const response = await api.delete(`/channels/${channelId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },

  leaveChannel: async (channelId: string) => {
    const response = await api.post(
      `/channels/${channelId}/leave`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },

  getChannel: async (channelId: string) => {
    try {
      const response = await api.get(`/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in getChannel:", error);
      throw error;
    }
  },
};

export const uploadService = {
  uploadProfilePicture: async (file: File): Promise<string> => {
    try {
      // Upload to Firebase
      const imageUrl = await firebaseStorage.uploadImage(file, "users");

      // Update user profile in your backend
      const response = await fetch(`${API_URL}/users/profile-picture`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
      });

      if (!response.ok) {
        // If backend update fails, delete the uploaded image
        await firebaseStorage.deleteImage(imageUrl);
        throw new Error("Failed to update profile picture");
      }

      return imageUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },

  uploadChannelPicture: async (
    channelId: string,
    file: File
  ): Promise<string> => {
    try {
      // Upload to Firebase
      const imageUrl = await firebaseStorage.uploadImage(file, "channels");

      // Update channel in your backend
      const response = await fetch(`/api/channels/${channelId}/picture`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) {
        // If backend update fails, delete the uploaded image
        await firebaseStorage.deleteImage(imageUrl);
        throw new Error("Failed to update channel picture");
      }

      return imageUrl;
    } catch (error) {
      console.error("Error uploading channel picture:", error);
      throw error;
    }
  },

  deleteProfilePicture: async (imageUrl: string): Promise<void> => {
    try {
      // Delete from Firebase
      await firebaseStorage.deleteImage(imageUrl);

      // Update user profile in your backend
      const response = await fetch("/api/users/profile-picture", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      throw error;
    }
  },

  deleteChannelPicture: async (
    channelId: string,
    imageUrl: string
  ): Promise<void> => {
    try {
      // Delete from Firebase
      await firebaseStorage.deleteImage(imageUrl);

      // Update channel in your backend
      const response = await fetch(`/api/channels/${channelId}/picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete channel picture");
      }
    } catch (error) {
      console.error("Error deleting channel picture:", error);
      throw error;
    }
  },
};

export default api;
