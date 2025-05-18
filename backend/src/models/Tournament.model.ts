import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.model.js";
import { IChannel } from "./Channel.model.js";

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
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tournamentSchema.index({ channel: 1 });
tournamentSchema.index({ organizer: 1 });

const Tournament = mongoose.model<ITournament>("Tournament", tournamentSchema);

export { Tournament };
