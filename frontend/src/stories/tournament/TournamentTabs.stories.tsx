import type { Meta, StoryObj } from "@storybook/react";
import TournamentTabs from "./TournamentTabs";
import { Tournament, TournamentStatus, ChannelUserStats } from "../types";

const meta = {
  title: "Tournament/TournamentTabs",
  component: TournamentTabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentTabs>;

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
};

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
    activeTab: 0,
    setActiveTab: (value: number) => console.log("Tab changed:", value),
    userStats: mockUserStats,
    tournaments: [mockTournament],
    isAdmin: true,
    onUserClick: (userId: string) => console.log("User clicked:", userId),
    onTournamentClick: (tournament: Tournament) =>
      console.log("Tournament clicked:", tournament.id),
    onEditTournament: (tournament: Tournament) =>
      console.log("Edit clicked:", tournament.id),
    onDeleteTournament: (tournament: Tournament) =>
      console.log("Delete clicked:", tournament.id),
    onCreateTournament: () => console.log("Create tournament clicked"),
  },
};
