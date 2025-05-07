import type { Meta, StoryObj } from "@storybook/react";
import { TournamentParticipants } from "../../ll-tournament/components/CreateTournament/TournamentParticipants";
import { ParticipantStatus } from "../../ll-tournament/types";

const meta: Meta<typeof TournamentParticipants> = {
  title: "CreateTournament/TournamentParticipants",
  component: TournamentParticipants,
};
export default meta;

type Story = StoryObj<typeof TournamentParticipants>;

const mockChannelUsers = [
  {
    id: "1",
    userId: "1",
    username: "Alice",
    status: ParticipantStatus.CONFIRMED,
  },
  { id: "2", userId: "2", username: "Bob", status: ParticipantStatus.PENDING },
];
const mockGuestUsers = [
  { id: "guest_1", username: "Guest1" },
  { id: "guest_2", username: "Guest2" },
];

export const Default: Story = {
  args: {
    channelUsers: mockChannelUsers,
    guestUsers: mockGuestUsers,
    draggedParticipant: null,
    onDragStart: () => {},
    onDragEnd: () => {},
    onAddGuest: () => {},
    onRemoveGuest: () => {},
  },
};
