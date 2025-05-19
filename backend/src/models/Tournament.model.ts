import mongoose, { Schema, Document } from "mongoose";

export interface ITournament extends Document {
  name: string;
  description: string;
  channelId: mongoose.Types.ObjectId;
  date: string;
  time: string;
}

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tournamentSchema.index({ channelId: 1 });

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  tournamentSchema
);
