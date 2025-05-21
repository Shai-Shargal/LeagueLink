export type ParticipantStatus = "guest" | "member" | "admin";

export interface DraggableParticipant {
  userId: string;
  username: string;
  isGuest: boolean;
  type: "player" | "team";
  id: string;
  players?: { id: string; isGuest: boolean }[];
  profilePicture?: string;
  status?: ParticipantStatus;
}

export interface Team {
  type: "player" | "team";
  id: string;
  isGuest: boolean;
  score: number;
  players?: { id: string; isGuest: boolean }[];
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  teamType: "solo" | "team";
  team1: Team | null;
  team2: Team | null;
  position: { x: number; y: number };
  rounds: number;
  status?: string;
  winner?: string;
  nextMatchId?: string;
  games?: Array<{
    gameNumber: number;
    status: string;
    stats: {
      team1: any[];
      team2: any[];
    };
  }>;
}

export interface MatchUpdate {
  id: string;
  round?: number;
  matchNumber?: number;
  team1?: Team | null;
  team2?: Team | null;
  position?: { x: number; y: number };
  score1?: number;
  score2?: number;
  winner?: DraggableParticipant | null;
  nextMatchId?: string;
}

export interface GuestUser {
  id: string;
  username: string;
  profilePicture?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  channelId: string;
  startDate: string;
  maxParticipants: number;
  participants: TournamentParticipant[];
  statsConfig: TournamentStatsConfig;
  structure?: TournamentStructure;
  matches: Match[];
  date: string;
  time: string;
  location: string;
  createdBy: string;
  createdAt: string;
  status: TournamentStatus;
  sportType: string;
  matchConfig: MatchConfig;
  format?: string;
  participantsCount?: number;
  completed?: boolean;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  username: string;
  teamName?: string;
  profilePicture?: string;
  status?: ParticipantStatus;
  stats: ParticipantStats;
  isGuest?: boolean;
}

export interface ParticipantStats {
  [key: string]: number | string;
}

export interface TournamentStatsConfig {
  enabledStats: string[];
  customStats: CustomStat[];
}

export interface CustomStat {
  name: string;
  type: "number" | "text";
  description: string;
}

export enum TournamentStatus {
  UPCOMING = "UPCOMING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface ChannelUserStats {
  userId: string;
  username: string;
  profilePicture?: string;
  totalTournaments: number;
  wins: number;
  losses: number;
  winRate: number;
  customStats: {
    [key: string]: number | string;
  };
}

export interface TournamentStructure {
  groups: number;
  participantsPerGroup: number;
  knockoutRounds: string[];
  seedingMethod: "ranking" | "random";
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  round: number;
  position: number;
  team1: TournamentParticipant;
  team2: TournamentParticipant;
  score1?: number;
  score2?: number;
  winner?: TournamentParticipant;
}

export interface MatchConfig {
  teamType: "1v1" | "team";
  bestOf: number;
  stats: {
    enabled: string[];
    custom: Array<{
      name: string;
      type: "number" | "boolean" | "text";
      required: boolean;
    }>;
  };
}
