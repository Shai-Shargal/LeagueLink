import { Tournament, ChannelUserStats, TournamentStatsConfig } from "../types";

const API_BASE_URL = "http://localhost:5000/api/tournaments";

const defaultStatsConfig: TournamentStatsConfig = {
  enabledStats: ["wins", "losses", "winRate"],
  customStats: [],
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const tournamentService = {
  // Tournament operations
  async createTournament(
    channelId: string,
    tournamentData: Partial<Tournament>
  ) {
    // Transform the data to match backend expectations
    const backendData = {
      name: tournamentData.name,
      description: "Tournament created through the LeagueLink platform",
      channelId: channelId,
      format: "single_elimination",
      startDate: new Date(
        tournamentData.date + "T" + tournamentData.time
      ).toISOString(),
      maxParticipants: 8,
      rules: "Standard tournament rules apply",
      prizes: "Trophies for winners",
      participants: tournamentData.participants?.map((p) => p.userId) || [],
      statsConfig: tournamentData.statsConfig || defaultStatsConfig,
    };

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
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

  async deleteTournament(tournamentId: string) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
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
