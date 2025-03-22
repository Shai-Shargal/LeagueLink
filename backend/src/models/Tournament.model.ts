import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User.model.js";
import { IChannel } from "./Channel.model.js";

export interface IMatch {
  participants: mongoose.Types.ObjectId[];
  scores: number[];
  winner?: mongoose.Types.ObjectId;
  scheduledDate: Date;
  completedDate?: Date;
  round: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface ITournament extends Document {
  name: string;
  description: string;
  channel: IChannel["_id"];
  organizer: IUser["_id"];
  format: "single_elimination" | "double_elimination" | "round_robin" | "swiss";
  startDate: Date;
  maxParticipants: number;
  participants: IUser["_id"][];
  rules: string;
  prizes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  scores: [
    {
      type: Number,
      required: true,
    },
  ],
  winner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  completedDate: {
    type: Date,
  },
  round: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
});

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    format: {
      type: String,
      enum: [
        "single_elimination",
        "double_elimination",
        "round_robin",
        "swiss",
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rules: {
      type: String,
      required: true,
      trim: true,
    },
    prizes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tournamentSchema.index({ channel: 1, status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ organizer: 1 });

const Tournament = mongoose.model<ITournament>("Tournament", tournamentSchema);
export { Tournament };
