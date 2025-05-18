import type { Team, Match, DraggableParticipant } from "./types/index";

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
  isGuest?: boolean;
  teamName?: string;
}

export interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournament: any) => void;
  newTournament: {
    name: string;
    description: string;
    location: string;
    startDate: string;
    time: string;
  };
  onTournamentChange: (field: string, value: string | number) => void;
  isCreating: boolean;
  isEditing?: boolean;
  existingTournament?: Tournament;
  channelId: string;
}

export const DIALOG_WIDTH = 1200;
export const DIALOG_HEIGHT = 800;
export const SIDEBAR_WIDTH = 300;
export const GAMES_AREA_HEIGHT = 600;
export const BASE_BOX_WIDTH = 160;
export const BASE_BOX_HEIGHT = 110;
export const ROUND_HORIZONTAL_GAP = 250;
export const INITIAL_TOP_MARGIN = 50;

export enum ParticipantStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  DECLINED = "declined",
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  isGuest: boolean;
}

export interface Team {
  type: "team";
  id: string;
  isGuest: boolean;
  score: number;
  players: Player[];
}

export interface PlayerTeam {
  type: "player";
  id: string;
  isGuest: boolean;
  score: number;
}

export type TeamType = Team | PlayerTeam | null;

export interface Match {
  id: string;
  position: Position;
  team1: TeamType;
  team2: TeamType;
  rounds: number;
  teamType: "solo" | "team";
  nextMatchId?: string;
  round?: number;
  matchNumber?: number;
}
