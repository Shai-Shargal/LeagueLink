import { Tournament, TournamentStatsConfig, ParticipantStatus } from "../types";

const API_BASE_URL = "http://localhost:5000/api/tournaments";

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
      startDate:
        tournamentData.date && tournamentData.time
          ? `${tournamentData.date}T${tournamentData.time}`
          : new Date().toISOString(),
      location: tournamentData.location,
      participants:
        tournamentData.participants?.map((p) => ({
          userId: p.userId,
          username: p.username,
          isGuest: p.isGuest || false,
          status: p.status,
        })) || [],
      matches:
        tournamentData.matches?.map((m) => ({
          round: m.round,
          matchNumber: m.matchNumber,
          team1: m.team1
            ? {
                userId: m.team1.userId,
                username: m.team1.username,
                isGuest: m.team1.isGuest || false,
                status: m.team1.status,
              }
            : null,
          team2: m.team2
            ? {
                userId: m.team2.userId,
                username: m.team2.username,
                isGuest: m.team2.isGuest || false,
                status: m.team2.status,
              }
            : null,
          position: m.position,
          score1: m.score1 || 0,
          score2: m.score2 || 0,
          winner: m.winner || null,
        })) || [],
      matchConfig: tournamentData.matchConfig || {
        rounds: 5, // Default to best of 5
      },
    };

    console.log("Sending tournament data to backend:", backendData); // Debug log

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    const data = await handleResponse(response);
    return data.data;
  },

  async getChannelTournaments(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    const tournaments = data.data || [];
    console.log("Raw tournament data:", tournaments); // Debug log
    return tournaments.map((tournament: any) => {
      console.log(
        "Processing tournament:",
        tournament.name,
        "matches:",
        tournament.matches
      ); // Debug log
      return {
        ...tournament,
        id: tournament._id,
        channelId: tournament.channel,
        date: new Date(tournament.startDate).toISOString().split("T")[0], // Format as YYYY-MM-DD
        time: new Date(tournament.startDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        matches:
          tournament.matches?.map((match: any) => {
            console.log("Processing match:", match); // Debug log
            return {
              id: match.id || match._id,
              round: match.round || 1,
              matchNumber: match.matchNumber || 1,
              team1: match.team1
                ? {
                    userId: match.team1.userId,
                    username: match.team1.username,
                    isGuest: match.team1.isGuest || false,
                    status: match.team1.status || ParticipantStatus.PENDING,
                  }
                : null,
              team2: match.team2
                ? {
                    userId: match.team2.userId,
                    username: match.team2.username,
                    isGuest: match.team2.isGuest || false,
                    status: match.team2.status || ParticipantStatus.PENDING,
                  }
                : null,
              position: match.position || {
                x: (match.round - 1) * 220,
                y: match.matchNumber * 100,
              },
              score1: match.score1 || 0,
              score2: match.score2 || 0,
              winner: match.winner || null,
            };
          }) || [],
        participants: tournament.participants.map((p: any) => ({
          userId: p.userId || p._id || p,
          username: p.username || "Unknown",
          status: ParticipantStatus.PENDING,
          stats: {},
        })),
      };
    });
  },

  async getTournament(tournamentId: string) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateTournament(
    tournamentId: string,
    tournamentData: Partial<Tournament>
  ) {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...tournamentData,
        matches: tournamentData.matches?.map((match) => ({
          id: match.id,
          round: match.round,
          matchNumber: match.matchNumber,
          team1: match.team1,
          team2: match.team2,
          position: match.position,
          score1: match.score1,
          score2: match.score2,
          winner: match.winner,
        })),
      }),
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
