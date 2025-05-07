import type { Meta, StoryObj } from "@storybook/react";
import { TournamentToolbar } from "../../ll-tournament/components/CreateTournament/TournamentToolbar";

const meta: Meta<typeof TournamentToolbar> = {
  title: "Tournament/TournamentToolbar",
  component: TournamentToolbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TournamentToolbar>;

export const Default: Story = {
  args: {
    matchesCount: 5,
    historyIndex: 2,
    onAddMatch: () => console.log("Add match clicked"),
    onUndo: () => console.log("Undo clicked"),
    onRedo: () => console.log("Redo clicked"),
    onAutoArrange: () => console.log("Auto arrange clicked"),
    onClearAll: () => console.log("Clear all clicked"),
  },
};

export const NoMatches: Story = {
  args: {
    matchesCount: 0,
    historyIndex: 0,
    onAddMatch: () => console.log("Add match clicked"),
    onUndo: () => console.log("Undo clicked"),
    onRedo: () => console.log("Redo clicked"),
    onAutoArrange: () => console.log("Auto arrange clicked"),
    onClearAll: () => console.log("Clear all clicked"),
  },
};

export const CanUndo: Story = {
  args: {
    matchesCount: 10,
    historyIndex: 5,
    onAddMatch: () => console.log("Add match clicked"),
    onUndo: () => console.log("Undo clicked"),
    onRedo: () => console.log("Redo clicked"),
    onAutoArrange: () => console.log("Auto arrange clicked"),
    onClearAll: () => console.log("Clear all clicked"),
  },
};

export const CanRedo: Story = {
  args: {
    matchesCount: 10,
    historyIndex: 0,
    onAddMatch: () => console.log("Add match clicked"),
    onUndo: () => console.log("Undo clicked"),
    onRedo: () => console.log("Redo clicked"),
    onAutoArrange: () => console.log("Auto arrange clicked"),
    onClearAll: () => console.log("Clear all clicked"),
  },
};
