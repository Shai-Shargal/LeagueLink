import type { Meta, StoryObj } from "@storybook/react";
import TournamentList from "./TournamentList";
import { Tournament, TournamentStatus } from "../types";

const meta = {
  title: "Tournament/TournamentList",
  component: TournamentList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TournamentList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTournament: Tournament = {
  id: "1",
  name: "Summer Tournament",
  status: TournamentStatus.IN_PROGRESS,
  participants: [],
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

export const Default: Story = {
  args: {
    tournaments: [
      mockTournament,
      {
        ...mockTournament,
        id: "2",
        name: "Winter Championship",
        status: TournamentStatus.COMPLETED,
      },
    ],
    isAdmin: true,
    onTournamentClick: (tournament: Tournament) =>
      console.log("Tournament clicked:", tournament.id),
    onEditTournament: (tournament: Tournament) =>
      console.log("Edit clicked:", tournament.id),
    onDeleteTournament: (tournament: Tournament) =>
      console.log("Delete clicked:", tournament.id),
  },
};
