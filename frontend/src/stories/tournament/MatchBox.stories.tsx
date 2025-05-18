import type { Meta, StoryObj } from "@storybook/react";
import { MatchBox } from "../../ll-tournament/components/EditTournament/MatchBox";
import { ParticipantStatus } from "../../ll-tournament/types";

const meta: Meta<typeof MatchBox> = {
  title: "CreateTournament/MatchBox",
  component: MatchBox,
};
export default meta;

type Story = StoryObj<typeof MatchBox>;

const mockParticipant1 = {
  id: "1",
  userId: "1",
  username: "Alice",
  profilePicture: "https://randomuser.me/api/portraits/women/1.jpg",
  status: ParticipantStatus.CONFIRMED,
};
const mockParticipant2 = {
  id: "2",
  userId: "2",
  username: "Bob",
  status: ParticipantStatus.PENDING,
};

const mockMatch = {
  id: "m1",
  round: 1,
  matchNumber: 1,
  position: { x: 100, y: 100 },
  team1: mockParticipant1,
  team2: mockParticipant2,
};

export const Default: Story = {
  args: {
    match: mockMatch,
    channelUsers: [mockParticipant1, mockParticipant2],
    draggedParticipant: null,
    onDragStart: () => {},
    onDragEnd: () => {},
    onDelete: () => {},
    onUpdate: () => {},
    parentWidth: 400,
    parentHeight: 200,
  },
};
