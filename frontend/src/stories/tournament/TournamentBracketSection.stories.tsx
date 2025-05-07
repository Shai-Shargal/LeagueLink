import type { Meta, StoryObj } from "@storybook/react";
import TournamentBracketSection from "./TournamentBracketSection";

const meta = {
  title: "Tournament/TournamentBracketSection",
  component: TournamentBracketSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentBracketSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample tournament data
const sampleTournament = {
  id: "1",
  name: "Sample Tournament",
  matches: [
    {
      id: "1",
      round: 1,
      team1: { username: "Team A", profilePicture: "" },
      team2: { username: "Team B", profilePicture: "" },
      position: { x: 0, y: 0 },
    },
    {
      id: "2",
      round: 1,
      team1: { username: "Team C", profilePicture: "" },
      team2: { username: "Team D", profilePicture: "" },
      position: { x: 0, y: 140 },
    },
    {
      id: "3",
      round: 2,
      team1: null,
      team2: null,
      position: { x: 300, y: 70 },
    },
  ],
};

export const Default: Story = {
  args: {
    tournament: sampleTournament,
    onUpdateMatch: (match) => console.log("Match updated:", match),
  },
};
