import type { Meta, StoryObj } from "@storybook/react";
import { TournamentForm } from "../../ll-tournament/components/CreateTournament/TournamentForm";

const meta: Meta<typeof TournamentForm> = {
  title: "CreateTournament/TournamentForm",
  component: TournamentForm,
};
export default meta;

type Story = StoryObj<typeof TournamentForm>;

const mockTournament = {
  name: "",
  location: "",
  date: "2024-12-31",
  time: "12:00",
  participants: [],
};

export const Default: Story = {
  args: {
    newTournament: mockTournament,
    onTournamentChange: () => {},
    errors: {},
    isCreating: false,
  },
};

export const WithError: Story = {
  args: {
    newTournament: mockTournament,
    onTournamentChange: () => {},
    errors: { name: "Tournament name is required" },
    isCreating: false,
  },
};
