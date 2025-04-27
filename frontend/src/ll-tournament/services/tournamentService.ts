import { Tournament, ChannelUserStats, TournamentStatsConfig } from "../types";

const API_BASE_URL = "/api/tournaments";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server returned non-JSON response");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }
  return data;
};

export const tournamentService = {
  // Tournament operations
  async createTournament(
    channelId: string,
    tournamentData: Partial<Tournament>
  ) {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...tournamentData, channelId }),
    });
    return handleResponse(response);
  },

  async getChannelTournaments(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data || [];
  },

  async getTournament(tournamentId: string) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateTournament(tournamentId: string, updates: Partial<Tournament>) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Statistics operations
  async getChannelUserStats(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/stats/channel/${channelId}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data || [];
  },

  async getTournamentStats(tournamentId: string) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data || [];
  },

  async updateTournamentStatsConfig(
    tournamentId: string,
    config: TournamentStatsConfig
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${tournamentId}/stats-config`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(config),
      }
    );
    return handleResponse(response);
  },

  // Participant operations
  async addParticipant(tournamentId: string, userId: string) {
    const response = await fetch(
      `${API_BASE_URL}/${tournamentId}/participants`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      }
    );
    return handleResponse(response);
  },

  async updateParticipantStats(
    tournamentId: string,
    userId: string,
    stats: Record<string, any>
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${tournamentId}/participants/${userId}/stats`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(stats),
      }
    );
    return handleResponse(response);
  },
};
