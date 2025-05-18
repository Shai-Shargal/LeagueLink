import { Tournament, TournamentStatsConfig, ParticipantStatus } from "../types";
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  SportsTennis as SportsIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:5000/api";
const TOURNAMENT_URL = `${API_BASE_URL}/tournaments`;
const MATCH_URL = `${API_BASE_URL}/matches`;

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
    tournamentData: {
      name: string;
      description?: string;
      startDate: string;
      location: string;
    }
  ) {
    // Only send basic tournament fields
    const backendData = {
      name: tournamentData.name,
      description: tournamentData.description || "",
      channelId: channelId,
      startDate: tournamentData.startDate,
      location: tournamentData.location,
    };

    console.log(
      "Step 1: Creating tournament with data:",
      JSON.stringify(backendData, null, 2)
    );

    const response = await fetch(`${TOURNAMENT_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    return handleResponse(response);
  },

  // Match operations
  async createMatches(tournamentId: string, matches: any[]) {
    const matchesPayload = matches.map((match) => ({
      tournament: tournamentId,
      round: match.round,
      matchNumber: match.matchNumber,
      bestOf: match.rounds,
      team1: {
        players:
          match.team1?.players?.map((p) => ({
            userId: p.id,
            username: p.username || "",
          })) || [],
        isGuest: match.team1?.isGuest || false,
      },
      team2: {
        players:
          match.team2?.players?.map((p) => ({
            userId: p.id,
            username: p.username || "",
          })) || [],
        isGuest: match.team2?.isGuest || false,
      },
      position: match.position,
      nextMatchId: match.nextMatchId,
      stats: {},
      status: "pending",
    }));

    console.log(
      "Sending matches data to backend:",
      JSON.stringify(matchesPayload, null, 2)
    );

    const response = await fetch(
      `${MATCH_URL}/tournament/${tournamentId}/bulk`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ matches: matchesPayload }),
      }
    );
    return handleResponse(response);
  },

  async getChannelTournaments(channelId: string) {
    const response = await fetch(`${TOURNAMENT_URL}/channel/${channelId}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data.map((tournament: any) => ({
      id: tournament._id || tournament.id,
      name: tournament.name,
      description: tournament.description,
      channelId: tournament.channel,
      startDate: tournament.startDate,
      location: tournament.location,
      status: tournament.status,
      participants: tournament.participants.map((p: any) => ({
        userId: p.userId || p._id || p,
        username: p.username || "Unknown",
        status: ParticipantStatus.PENDING,
        stats: {},
      })),
    }));
  },

  async getTournament(tournamentId: string) {
    const response = await fetch(`${TOURNAMENT_URL}/${tournamentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateTournament(
    tournamentId: string,
    tournamentData: Partial<Tournament>
  ) {
    const response = await fetch(`${TOURNAMENT_URL}/${tournamentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: tournamentData.name,
        description: tournamentData.description,
        startDate: tournamentData.startDate,
        location: tournamentData.location,
      }),
    });
    return handleResponse(response);
  },

  async deleteTournament(tournamentId: string) {
    const response = await fetch(`${TOURNAMENT_URL}/${tournamentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Statistics operations
  async getChannelUserStats(channelId: string) {
    const response = await fetch(
      `${TOURNAMENT_URL}/stats/channel/${channelId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await handleResponse(response);
    return data.data || [];
  },

  async getTournamentStats(tournamentId: string) {
    const response = await fetch(`${TOURNAMENT_URL}/${tournamentId}/stats`, {
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
      `${TOURNAMENT_URL}/${tournamentId}/stats-config`,
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
      `${TOURNAMENT_URL}/${tournamentId}/participants`,
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
      `${TOURNAMENT_URL}/${tournamentId}/participants/${userId}/stats`,
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
    const response = await fetch(`${MATCH_URL}/${matchId}/best-of`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ bestOf }),
    });
    return handleResponse(response);
  },
};
