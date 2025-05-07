import type { Meta, StoryObj } from "@storybook/react";
import CreateTournamentDialog from "../../ll-tournament/components/CreateTournament/CreateTournamentDialog";
import { ParticipantStatus } from "../../ll-tournament/types";

const meta: Meta<typeof CreateTournamentDialog> = {
  title: "CreateTournament/CreateTournamentDialog",
  component: CreateTournamentDialog,
};
export default meta;

type Story = StoryObj<typeof CreateTournamentDialog>;

const mockTournament = {
  name: "",
  location: "",
  date: "2024-12-31",
  time: "12:00",
  participants: [],
};

const mockUsers = [
  {
    id: "1",
    userId: "1",
    username: "Alice",
    status: ParticipantStatus.CONFIRMED,
  },
  { id: "2", userId: "2", username: "Bob", status: ParticipantStatus.PENDING },
];

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSubmit: () => {},
    newTournament: mockTournament,
    onTournamentChange: () => {},
    channelUsers: mockUsers,
    isCreating: false,
  },
};
