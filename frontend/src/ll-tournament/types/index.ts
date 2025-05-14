export type ParticipantStatus = "guest" | "member" | "admin";

export interface DraggableParticipant {
  id: string;
  userId: string;
  username: string;
  status: string;
  isGuest?: boolean;
}

export interface Team {
  type: "team" | "player";
  id: string;
  isGuest: boolean;
  score: number;
  players?: DraggableParticipant[];
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  teamType: "team" | "1v1";
  team1: Team | null;
  team2: Team | null;
  position: { x: number; y: number };
  rounds: number;
  status?: "pending" | "in_progress" | "completed";
  winner?: DraggableParticipant | null;
  nextMatchId?: string;
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
