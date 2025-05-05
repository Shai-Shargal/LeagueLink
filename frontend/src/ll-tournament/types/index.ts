export type ParticipantStatus = "guest" | "member" | "admin";

export interface DraggableParticipant {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  status: ParticipantStatus;
  stats: Record<string, any>;
  type: "channel" | "guest";
  isGuest?: boolean;
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1: DraggableParticipant | null;
  team2: DraggableParticipant | null;
  position: {
    x: number;
    y: number;
  };
  score1?: number;
  score2?: number;
  winner?: DraggableParticipant | null;
}

export interface GuestUser {
  id: string;
  username: string;
  profilePicture?: string;
}
