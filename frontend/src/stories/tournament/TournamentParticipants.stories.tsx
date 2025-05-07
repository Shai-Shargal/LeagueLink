import type { Meta, StoryObj } from "@storybook/react";
import { TournamentParticipants } from "../../ll-tournament/components/CreateTournament/TournamentParticipants";
import { ParticipantStatus } from "../../ll-tournament/types";

const meta: Meta<typeof TournamentParticipants> = {
  title: "Tournament/TournamentParticipants",
  component: TournamentParticipants,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TournamentParticipants>;

const mockChannelUsers = [
  {
    id: "1",
    userId: "1",
    username: "John Doe",
    profilePicture: "https://i.pravatar.cc/150?img=1",
    status: ParticipantStatus.PENDING,
  },
  {
    id: "2",
    userId: "2",
    username: "Jane Smith",
    profilePicture: "https://i.pravatar.cc/150?img=2",
    status: ParticipantStatus.PENDING,
  },
  {
    id: "3",
    userId: "3",
    username: "Mike Johnson",
    profilePicture: "https://i.pravatar.cc/150?img=3",
    status: ParticipantStatus.PENDING,
  },
];

const mockGuestUsers = [
  {
    id: "guest1",
    username: "Guest User 1",
  },
  {
    id: "guest2",
    username: "Guest User 2",
  },
];

export const Default: Story = {
  args: {
    channelUsers: mockChannelUsers,
    guestUsers: mockGuestUsers,
    draggedParticipant: null,
    onDragStart: (participant) => console.log("Drag start:", participant),
    onDragEnd: () => console.log("Drag end"),
    onAddGuest: () => console.log("Add guest clicked"),
    onRemoveGuest: (index) => console.log("Remove guest:", index),
  },
};

export const Empty: Story = {
  args: {
    channelUsers: [],
    guestUsers: [],
    draggedParticipant: null,
    onDragStart: (participant) => console.log("Drag start:", participant),
    onDragEnd: () => console.log("Drag end"),
    onAddGuest: () => console.log("Add guest clicked"),
    onRemoveGuest: (index) => console.log("Remove guest:", index),
  },
};

export const WithDraggedParticipant: Story = {
  args: {
    channelUsers: mockChannelUsers,
    guestUsers: mockGuestUsers,
    draggedParticipant: mockChannelUsers[0],
    onDragStart: (participant) => console.log("Drag start:", participant),
    onDragEnd: () => console.log("Drag end"),
    onAddGuest: () => console.log("Add guest clicked"),
    onRemoveGuest: (index) => console.log("Remove guest:", index),
  },
};
