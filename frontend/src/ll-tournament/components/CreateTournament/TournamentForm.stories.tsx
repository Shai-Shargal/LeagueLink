import type { Meta, StoryObj } from "@storybook/react";
import { TournamentForm } from "./TournamentForm";

const meta: Meta<typeof TournamentForm> = {
  title: "Tournament/TournamentForm",
  component: TournamentForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TournamentForm>;

export const Default: Story = {
  args: {
    newTournament: {
      name: "",
      location: "",
      date: "",
      time: "",
    },
    onTournamentChange: (field: string, value: string) => {
      console.log("Field:", field, "Value:", value);
    },
    errors: {},
    isCreating: false,
  },
};
