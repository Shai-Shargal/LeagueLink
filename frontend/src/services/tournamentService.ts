import axios from "axios";

const API_URL = "http://localhost:5000/api/tournaments";

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  channelId: string;
  sport?: string;
  createdBy?: {
    username: string;
    profilePicture?: string;
  };
  participantsCount?: number;
  status?: "upcoming" | "in_progress" | "completed";
}

export const tournamentService = {
  // Get all tournaments for a channel
  getTournamentsByChannel: async (channelId: string): Promise<Tournament[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/channel/${channelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Get a single tournament
  getTournament: async (tournamentId: string): Promise<Tournament> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/${tournamentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Create a new tournament
  createTournament: async (
    tournamentData: Omit<Tournament, "_id">
  ): Promise<Tournament> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(API_URL, tournamentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Update a tournament
  updateTournament: async (
    tournamentId: string,
    tournamentData: Partial<Tournament>
  ): Promise<Tournament> => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/${tournamentId}`,
      tournamentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  // Delete a tournament
  deleteTournament: async (tournamentId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/${tournamentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
