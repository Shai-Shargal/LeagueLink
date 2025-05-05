import { Tournament, ParticipantStatus } from "../../ll-tournament/types";

export interface DraggableParticipant {
  id: string;
  username: string;
  profilePicture?: string;
  status: ParticipantStatus;
}

export interface Match {
  id: string;
  position: {
    x: number;
    y: number;
  };
  team1: DraggableParticipant | null;
  team2: DraggableParticipant | null;
}

export interface GuestUser {
  id: string;
  username: string;
  profilePicture?: string;
}

export interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournamentData: any) => void;
  newTournament: Partial<Tournament>;
  onTournamentChange: (field: keyof Tournament, value: any) => void;
  channelUsers: { id: string; username: string; profilePicture?: string }[];
  isCreating: boolean;
}

export const DIALOG_WIDTH = 1200;
export const DIALOG_HEIGHT = 800;
export const GAMES_AREA_HEIGHT = 600;
export const BASE_BOX_WIDTH = 220;
export const BASE_BOX_HEIGHT = 120;
export const ROUND_HORIZONTAL_GAP = 60;
export const INITIAL_TOP_MARGIN = 40;

export { ParticipantStatus };
