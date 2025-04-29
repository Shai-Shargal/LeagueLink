export interface TournamentStructure {
  groups: number;
  participantsPerGroup: number;
  knockoutRounds: string[];
  seedingMethod: "ranking" | "random";
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1: TournamentParticipant;
  team2: TournamentParticipant;
  score1?: number;
  score2?: number;
  winner?: TournamentParticipant;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  channelId: string;
  format: "single_elimination" | "double_elimination" | "round_robin";
  startDate: string;
  maxParticipants: number;
  rules?: string;
  prizes?: string;
  participants: TournamentParticipant[];
  statsConfig: TournamentStatsConfig;
  structure?: TournamentStructure;
  matches?: Match[];
  date: string;
  time: string;
  location: string;
  createdBy: string;
  createdAt: string;
  status: TournamentStatus;
}

export interface TournamentParticipant {
  userId: string;
  username: string;
  status: ParticipantStatus;
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

export enum ParticipantStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
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

export interface GuestUser {
  username: string;
  email?: string;
  phone?: string;
}
