import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  tournament: mongoose.Types.ObjectId;
  round: number;
  matchNumber: number;
  teamType: "1v1" | "team";
  status: "pending" | "in_progress" | "completed";
  winner: mongoose.Types.ObjectId | null;
  bestOf: number;
  games: Array<{
    gameNumber: number;
    status: "pending" | "in_progress" | "completed";
    winner: mongoose.Types.ObjectId | null;
    stats: {
      team1: {
        player: mongoose.Types.ObjectId;
        stats: Record<string, number>;
      }[];
      team2: {
        player: mongoose.Types.ObjectId;
        stats: Record<string, number>;
      }[];
    };
  }>;
  team1: {
    type: "player" | "team";
    id: mongoose.Types.ObjectId;
    score: number;
  };
  team2: {
    type: "player" | "team";
    id: mongoose.Types.ObjectId;
    score: number;
  };
  nextMatch: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    matchNumber: {
      type: Number,
      required: true,
    },
    teamType: {
      type: String,
      enum: ["1v1", "team"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    winner: {
      type: Schema.Types.ObjectId,
      refPath: "team1.type",
      default: null,
    },
    bestOf: {
      type: Number,
      required: true,
      min: 1,
    },
    games: [
      {
        gameNumber: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending",
        },
        winner: {
          type: Schema.Types.ObjectId,
          refPath: "team1.type",
          default: null,
        },
        stats: {
          team1: [
            {
              player: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              stats: {
                type: Map,
                of: Number,
                default: {},
              },
            },
          ],
          team2: [
            {
              player: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              stats: {
                type: Map,
                of: Number,
                default: {},
              },
            },
          ],
        },
      },
    ],
    team1: {
      type: {
        type: String,
        enum: ["player", "team"],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: "team1.type",
        required: true,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    team2: {
      type: {
        type: String,
        enum: ["player", "team"],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: "team2.type",
        required: true,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    nextMatch: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MatchSchema.index(
  { tournament: 1, round: 1, matchNumber: 1 },
  { unique: true }
);
MatchSchema.index({ status: 1 });
MatchSchema.index({ winner: 1 });

export const Match = mongoose.model<IMatch>("Match", MatchSchema);
