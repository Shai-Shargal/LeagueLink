import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.model.js";
import { IChannel } from "./Channel.model.js";

export interface ITournamentParticipant {
  userId: string;
  username: string;
  isGuest: boolean;
  status: string;
}

export interface IMatch {
  id: string;
  round: number;
  matchNumber: number;
  team1: ITournamentParticipant | null;
  team2: ITournamentParticipant | null;
}

export interface ITournament extends Document {
  name: string;
  description: string;
  channel: mongoose.Types.ObjectId | IChannel;
  organizer: mongoose.Types.ObjectId | IUser;
  format: string;
  startDate: Date;
  location: string;
  maxParticipants: number;
  rules: string;
  prizes: string;
  participants: ITournamentParticipant[];
  matches: IMatch[];
  status: string;
  statsConfig: {
    enabledStats: string[];
    customStats: any[];
  };
  matchConfig: {
    teamType: "1v1" | "team";
    bestOf: number;
    stats: {
      enabled: string[];
      custom: Array<{
        name: string;
        type: "number" | "boolean" | "text";
        required: boolean;
      }>;
    };
  };
}

const tournamentParticipantSchema = new Schema({
  userId: String,
  username: String,
  isGuest: Boolean,
  status: String,
});

const matchSchema = new Schema({
  id: String,
  round: Number,
  matchNumber: Number,
  team1: { type: tournamentParticipantSchema, default: null },
  team2: { type: tournamentParticipantSchema, default: null },
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
    format: {
      type: String,
      enum: ["single_elimination", "double_elimination", "round_robin"],
      default: "single_elimination",
    },
    startDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    maxParticipants: {
      type: Number,
      default: 32,
    },
    rules: {
      type: String,
      default: "Standard tournament rules apply",
    },
    prizes: {
      type: String,
      default: "Trophies for winners",
    },
    participants: {
      type: [tournamentParticipantSchema],
      default: [],
    },
    matches: {
      type: [matchSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    statsConfig: {
      enabledStats: {
        type: [String],
        default: ["wins", "losses", "winRate"],
      },
      customStats: {
        type: [Schema.Types.Mixed],
        default: [],
      },
    },
    matchConfig: {
      teamType: {
        type: String,
        enum: ["1v1", "team"],
        default: "1v1",
      },
      bestOf: {
        type: Number,
        default: 3,
        min: 1,
      },
      stats: {
        enabled: {
          type: [String],
          default: ["score"],
        },
        custom: [
          {
            name: String,
            type: {
              type: String,
              enum: ["number", "boolean", "text"],
              default: "number",
            },
            required: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
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
