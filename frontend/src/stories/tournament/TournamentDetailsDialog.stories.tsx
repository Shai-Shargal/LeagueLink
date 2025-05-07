import type { Meta, StoryObj } from "@storybook/react";
import TournamentDetailsDialog from "./TournamentDetailsDialog";
import { Tournament, TournamentStatus } from "../types";

const meta = {
  title: "Tournament/TournamentDetailsDialog",
  component: TournamentDetailsDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentDetailsDialog>;

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
  matches: [],
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
  description: "A fun summer tournament for all skill levels",
  rules: "Standard tournament rules apply",
  prizes: "Trophy and bragging rights",
};

export const Default: Story = {
  args: {
    open: true,
    tournament: mockTournament,
    onClose: () => console.log("Dialog closed"),
    onUpdateMatch: (match) => console.log("Match updated:", match),
  },
};

export const NoTournament: Story = {
  args: {
    ...Default.args,
    tournament: null,
  },
};
