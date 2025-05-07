import type { Meta, StoryObj } from "@storybook/react";
import CreateTournamentDialog from "../../ll-tournament/components/CreateTournament/CreateTournamentDialog";
import { ParticipantStatus } from "../../ll-tournament/types";

const meta: Meta<typeof CreateTournamentDialog> = {
  title: "Tournament/CreateTournamentDialog",
  component: CreateTournamentDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
    stats: {},
  },
  {
    id: "2",
    userId: "2",
    username: "Bob",
    status: ParticipantStatus.PENDING,
    stats: {},
  },
  {
    id: "3",
    userId: "3",
    username: "Charlie",
    status: ParticipantStatus.CONFIRMED,
    stats: {},
  },
  {
    id: "4",
    userId: "4",
    username: "David",
    status: ParticipantStatus.PENDING,
    stats: {},
  },
];

const defaultArgs = {
  open: true,
  onClose: () => console.log("Dialog closed"),
  onSubmit: (data: any) => console.log("Form submitted:", data),
  onTournamentChange: (data: any) => console.log("Tournament changed:", data),
  channelUsers: mockUsers,
  isCreating: false,
};

export const Default: Story = {
  args: {
    ...defaultArgs,
    newTournament: mockTournament,
  },
};

export const WithExistingData: Story = {
  args: {
    ...defaultArgs,
    newTournament: {
      ...mockTournament,
      name: "Summer Championship",
      location: "Main Arena",
      date: "2024-07-15",
      time: "15:30",
      participants: mockUsers.slice(0, 2),
    },
  },
};

export const Creating: Story = {
  args: {
    ...defaultArgs,
    newTournament: mockTournament,
    isCreating: true,
  },
};

export const NoParticipants: Story = {
  args: {
    ...defaultArgs,
    newTournament: mockTournament,
    channelUsers: [],
  },
};

export const ManyParticipants: Story = {
  args: {
    ...defaultArgs,
    newTournament: mockTournament,
    channelUsers: [
      ...mockUsers,
      {
        id: "5",
        userId: "5",
        username: "Eve",
        status: ParticipantStatus.CONFIRMED,
        stats: {},
      },
      {
        id: "6",
        userId: "6",
        username: "Frank",
        status: ParticipantStatus.PENDING,
        stats: {},
      },
    ],
  },
};
