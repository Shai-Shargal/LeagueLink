import type { Meta, StoryObj } from "@storybook/react";
import { GuestDialog } from "../../ll-tournament/components/CreateTournament/GuestDialog";

const meta: Meta<typeof GuestDialog> = {
  title: "CreateTournament/GuestDialog",
  component: GuestDialog,
};
export default meta;

type Story = StoryObj<typeof GuestDialog>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    onAdd: () => {},
  },
};
