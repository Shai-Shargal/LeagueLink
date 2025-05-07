import type { Meta, StoryObj } from "@storybook/react";
import TournamentStatsTable from "./TournamentStatsTable";
import { ChannelUserStats } from "../types";

const meta = {
  title: "Tournament/TournamentStatsTable",
  component: TournamentStatsTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentStatsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUserStats: ChannelUserStats[] = [
  {
    userId: "user1",
    username: "Player 1",
    totalTournaments: 5,
    wins: 3,
    losses: 2,
    winRate: 0.6,
    customStats: {
      goals: 10,
      assists: 5,
    },
  },
  {
    userId: "user2",
    username: "Player 2",
    totalTournaments: 3,
    wins: 2,
    losses: 1,
    winRate: 0.67,
    customStats: {
      goals: 8,
      assists: 3,
    },
  },
];

export const Default: Story = {
  args: {
    userStats: mockUserStats,
    onUserClick: (userId: string) => console.log("User clicked:", userId),
  },
};

export const Empty: Story = {
  args: {
    userStats: [],
    onUserClick: (userId: string) => console.log("User clicked:", userId),
  },
};
