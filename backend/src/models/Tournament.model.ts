import mongoose, { Schema, Document } from "mongoose";

export interface ITournament extends Document {
  name: string;
  description: string;
  channelId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  location: string;
  matchIds: mongoose.Types.ObjectId[];
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
      validate: {
        validator: function (v: string) {
          // Validate time format (HH:mm)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format. Please use HH:mm format (e.g., 14:30)`,
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    matchIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tournamentSchema.index({ channelId: 1 });
tournamentSchema.index({ date: 1, time: 1 });

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  tournamentSchema
);
