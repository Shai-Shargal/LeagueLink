import type { Meta, StoryObj } from "@storybook/react";
import UserProfileDialog from "./UserProfileDialog";

const meta = {
  title: "Tournament/UserProfileDialog",
  component: UserProfileDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UserProfileDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser = {
  username: "Player 1",
  bio: "Passionate about sports and competition. Love playing soccer and basketball in my free time.",
  favoriteSports: ["⚽", "🏀"],
  profilePicture: "https://i.pravatar.cc/150?img=1",
};

export const Default: Story = {
  args: {
    open: true,
    user: mockUser,
    loading: false,
    onClose: () => console.log("Dialog closed"),
  },
};

export const Loading: Story = {
  args: {
    open: true,
    user: null,
    loading: true,
    onClose: () => console.log("Dialog closed"),
  },
};

export const NoUser: Story = {
  args: {
    open: true,
    user: null,
    loading: false,
    onClose: () => console.log("Dialog closed"),
  },
};
