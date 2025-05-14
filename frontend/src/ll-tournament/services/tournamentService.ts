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
    if (response.status === 404) {
      throw new Error(errorData.message || "Resource not found");
    }
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
      description: tournamentData.description || "",
      channelId: channelId,
      startDate: tournamentData.startDate,
      location: tournamentData.location || "Online",
      maxParticipants: tournamentData.maxParticipants || 32,
      matches:
        tournamentData.matches?.map((m) => {
          console.log("Processing match:", m); // Debug log for each match
          const transformedMatch = {
            round: m.round,
            matchNumber: m.matchNumber,
            teamType: m.teamType || "1v1",
            team1: m.team1
              ? {
                  type: m.teamType === "team" ? "team" : "player",
                  id: m.team1.id,
                  isGuest: m.team1.isGuest || false,
                  score: m.score1 || 0,
                  players:
                    m.team1.players?.map((p) => ({
                      id: p.id,
                      isGuest: p.isGuest || false,
                    })) || [],
                }
              : null,
            team2: m.team2
              ? {
                  type: m.teamType === "team" ? "team" : "player",
                  id: m.team2.id,
                  isGuest: m.team2.isGuest || false,
                  score: m.score2 || 0,
                  players:
                    m.team2.players?.map((p) => ({
                      id: p.id,
                      isGuest: p.isGuest || false,
                    })) || [],
                }
              : null,
            position: m.position,
            nextMatchId: m.nextMatchId,
            rounds: m.rounds || 3,
            status: "pending",
          };
          console.log("Transformed match:", transformedMatch); // Debug log for transformed match
          return transformedMatch;
        }) || [],
      matchConfig: tournamentData.matchConfig || {
        teamType: "1v1",
        bestOf: 3,
        stats: {
          enabled: ["score"],
          custom: [],
        },
      },
    };

    console.log(
      "Sending tournament data to backend:",
      JSON.stringify(backendData, null, 2)
    ); // Detailed debug log

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });
    return handleResponse(response);
  },

  async getChannelTournaments(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data.map((tournament: any) => {
      console.log("Processing tournament:", tournament); // Debug log
      return {
        id: tournament._id || tournament.id,
        name: tournament.name,
        description: tournament.description,
        channelId: tournament.channel,
        startDate: tournament.startDate,
        location: tournament.location,
        maxParticipants: tournament.maxParticipants,
        status: tournament.status,
        statsConfig: tournament.statsConfig,
        matchConfig: tournament.matchConfig,
        matches:
          tournament.matches?.map((match: any) => {
            console.log("Processing match:", match); // Debug log
            return {
              id: match.id || match._id,
              round: match.round || 1,
              matchNumber: match.matchNumber || 1,
              teamType: match.teamType || "1v1",
              team1: match.team1
                ? {
                    userId: match.team1.id,
                    username: match.team1.username,
                    isGuest: match.team1.isGuest || false,
                    status: match.team1.status || ParticipantStatus.PENDING,
                    players:
                      match.team1.players?.map((p: any) => ({
                        userId: p.id,
                        isGuest: p.isGuest || false,
                      })) || [],
                  }
                : null,
              team2: match.team2
                ? {
                    userId: match.team2.id,
                    username: match.team2.username,
                    isGuest: match.team2.isGuest || false,
                    status: match.team2.status || ParticipantStatus.PENDING,
                    players:
                      match.team2.players?.map((p: any) => ({
                        userId: p.id,
                        isGuest: p.isGuest || false,
                      })) || [],
                  }
                : null,
              position: match.position || {
                x: (match.round - 1) * 220,
                y: match.matchNumber * 100,
              },
              nextMatchId: match.nextMatch,
              score1: match.team1?.score || 0,
              score2: match.team2?.score || 0,
              winner: match.winner || null,
              rounds: match.bestOf || 3,
              status: match.status || "pending",
              games: match.games || [],
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

  // Match operations
  async updateMatchBestOf(
    tournamentId: string,
    matchId: string,
    bestOf: number
  ) {
    const response = await fetch(
      `${API_BASE_URL}/${tournamentId}/matches/${matchId}/best-of`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ bestOf }),
      }
    );
    return handleResponse(response);
  },
};
