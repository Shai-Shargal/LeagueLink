import type { Meta, StoryObj } from "@storybook/react";
import TournamentInfoSection from "./TournamentInfoSection";
import { Tournament, TournamentStatus } from "../types";

const meta = {
  title: "Tournament/TournamentInfoSection",
  component: TournamentInfoSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentInfoSection>;

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
    tournament: mockTournament,
  },
};
