export type ParticipantStatus = "guest" | "member" | "admin";

export interface DraggableParticipant {
  userId: string;
  username: string;
  isGuest: boolean;
  type: "player" | "team";
  id: string;
  players?: { id: string; isGuest: boolean }[];
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
  teamType: "1v1" | "team";
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
