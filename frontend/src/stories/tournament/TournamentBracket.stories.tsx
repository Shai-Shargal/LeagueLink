import type { Meta, StoryObj } from "@storybook/react";
import TournamentBracket from "./TournamentBracket";
import { Tournament, TournamentStatus } from "../types";

const meta = {
  title: "Tournament/TournamentBracket",
  component: TournamentBracket,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentBracket>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTournament: Tournament = {
  id: "1",
  name: "Summer Tournament",
  status: TournamentStatus.IN_PROGRESS,
  participants: [
    {
      id: "1",
      userId: "user1",
      username: "Team A",
      stats: {},
    },
    {
      id: "2",
      userId: "user2",
      username: "Team B",
      stats: {},
    },
  ],
  matches: [
    {
      id: "match1",
      round: 1,
      matchNumber: 1,
      position: { x: 0, y: 0 },
      team1: null,
      team2: null,
    },
  ],
  channelId: "channel1",
  format: "single_elimination",
  startDate: new Date().toISOString(),
  maxParticipants: 16,
  statsConfig: {
    enabledStats: ["wins", "losses", "goals"],
    customStats: [],
  },
  date: new Date().toISOString(),
  time: "12:00",
  location: "Online",
  createdBy: "user1",
  createdAt: new Date().toISOString(),
  sportType: "soccer",
};

export const Default: Story = {
  args: {
    tournament: mockTournament,
    onUpdateTournament: (tournament: Tournament) =>
      console.log("Tournament updated:", tournament),
    onUpdateMatch: async (match) => console.log("Match updated:", match),
  },
};
