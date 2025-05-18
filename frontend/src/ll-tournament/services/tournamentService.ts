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
    try {
      // Create new matches one by one
      const createdMatches = await Promise.all(
        matches.map(async (match) => {
          const matchPayload = {
            tournament: tournamentId,
            round: match.round || 1,
            matchNumber: match.matchNumber || 1,
            bestOf: match.rounds || 3,
            team1: {
              players:
                match.team1?.players?.map(
                  (p: { id: string; username?: string }) => ({
                    userId: p.id,
                    username: p.username || "",
                  })
                ) || [],
              isGuest: match.team1?.isGuest || false,
            },
            team2: {
              players:
                match.team2?.players?.map(
                  (p: { id: string; username?: string }) => ({
                    userId: p.id,
                    username: p.username || "",
                  })
                ) || [],
              isGuest: match.team2?.isGuest || false,
            },
            position: {
              x: match.position?.x || 0,
              y: match.position?.y || 0,
            },
            nextMatchId: match.nextMatchId || null,
            teamType: match.teamType || "1v1",
            stats: {},
            status: "pending",
            games: [],
          };

          console.log("Creating match:", JSON.stringify(matchPayload, null, 2));

          const response = await fetch(`${MATCH_URL}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(matchPayload),
          });

          if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              console.error("Error parsing error response:", e);
            }
            throw new Error(errorMessage);
          }

          return handleResponse(response);
        })
      );

      return createdMatches;
    } catch (error) {
      console.error("Error creating matches:", error);
      throw error;
    }
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
