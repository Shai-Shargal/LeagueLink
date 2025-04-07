export interface Tournament {
  id: string;
  channelId: string;
  name: string;
  date: string;
  time: string;
  location: string;
  createdBy: string;
  createdAt: string;
  status: TournamentStatus;
  participants: TournamentParticipant[];
  statsConfig: TournamentStatsConfig;
}

export interface TournamentParticipant {
  userId: string;
  username: string;
  status: ParticipantStatus;
  stats: ParticipantStats;
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
