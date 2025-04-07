import { Tournament, ChannelUserStats, TournamentStatsConfig } from "../types";

const API_BASE_URL = "/api/tournaments";

export const tournamentService = {
  // Tournament operations
  async createTournament(
    channelId: string,
    tournamentData: Partial<Tournament>
  ) {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...tournamentData, channelId }),
    });
    return response.json();
  },

  async getChannelTournaments(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}`);
    return response.json();
  },

  async getTournament(tournamentId: string) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`);
    return response.json();
  },

  async updateTournament(tournamentId: string, updates: Partial<Tournament>) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Statistics operations
  async getChannelUserStats(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/stats/channel/${channelId}`);
    return response.json();
  },

  async getTournamentStats(tournamentId: string) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/stats`);
    return response.json();
  },

  async updateTournamentStatsConfig(
    tournamentId: string,
    config: TournamentStatsConfig
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${tournamentId}/stats-config`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      }
    );
    return response.json();
  },

  // Participant operations
  async addParticipant(tournamentId: string, userId: string) {
    const response = await fetch(
      `${API_BASE_URL}/${tournamentId}/participants`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );
    return response.json();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stats),
      }
    );
    return response.json();
  },
};
