export interface CreateTournamentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tournament: any) => void;
  newTournament: {
    name: string;
    description: string;
    startDate: string;
    time: string;
    location: string;
  };
  onTournamentChange: (field: string, value: string) => void;
  isCreating: boolean;
  isEditing?: boolean;
  existingTournament?: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    time: string;
    location: string;
  };
  channelId: string;
  channelUsers?: Array<{
    id: string;
    userId: string;
    username: string;
    profilePicture?: string;
    status: string;
  }>;
}
