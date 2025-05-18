import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.model.js";
import { IChannel } from "./Channel.model.js";
import { IMatch } from "./Match.model.js";

export interface ITournamentParticipant {
  userId: string;
  username: string;
  isGuest: boolean;
  status: string;
}

export interface ITournament extends Document {
  name: string;
  description: string;
  channel: mongoose.Types.ObjectId | IChannel;
  organizer: mongoose.Types.ObjectId | IUser;
  startDate: Date;
  location: string;
  participants: ITournamentParticipant[];
  matches: mongoose.Types.ObjectId[] | IMatch[];
  status: "pending" | "active" | "completed";
}

const tournamentParticipantSchema = new Schema({
  userId: String,
  username: String,
  isGuest: Boolean,
  status: String,
});

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
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
    startDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    participants: {
      type: [tournamentParticipantSchema],
      default: [],
    },
    matches: [
      {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tournamentSchema.index({ channel: 1 });
tournamentSchema.index({ organizer: 1 });
tournamentSchema.index({ matches: 1 });

const Tournament = mongoose.model<ITournament>("Tournament", tournamentSchema);

export { Tournament };
