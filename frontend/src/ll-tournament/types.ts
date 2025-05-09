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

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  position: {
    x: number;
    y: number;
  };
  team1: DraggableParticipant | null;
  team2: DraggableParticipant | null;
  score1?: number;
  score2?: number;
  winner?: DraggableParticipant | null;
  nextMatchId?: string;
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
  sportType: string;
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

export interface GuestUser {
  id: string;
  username: string;
  profilePicture?: string;
}

export interface DraggableParticipant {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  status: ParticipantStatus;
}

export interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournament: any) => void;
  newTournament: any;
  onTournamentChange: (updates: any) => void;
  channelUsers: DraggableParticipant[];
  isCreating: boolean;
}

export const DIALOG_WIDTH = 1200;
export const DIALOG_HEIGHT = 800;
export const SIDEBAR_WIDTH = 300;
export const GAMES_AREA_HEIGHT = 600;
export const BASE_BOX_WIDTH = 200;
export const BASE_BOX_HEIGHT = 100;
export const ROUND_HORIZONTAL_GAP = 250;
export const INITIAL_TOP_MARGIN = 50;

export enum ParticipantStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
}
