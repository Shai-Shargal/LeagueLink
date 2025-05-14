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
        isGuest?: boolean;
        stats: Record<string, number>;
      }[];
      team2: {
        player: mongoose.Types.ObjectId;
        isGuest?: boolean;
        stats: Record<string, number>;
      }[];
    };
  }>;
  team1: {
    type: "player" | "team";
    id: mongoose.Types.ObjectId;
    isGuest?: boolean;
    score: number;
    players?: Array<{
      id: mongoose.Types.ObjectId;
      isGuest?: boolean;
    }>;
  };
  team2: {
    type: "player" | "team";
    id: mongoose.Types.ObjectId;
    isGuest?: boolean;
    score: number;
    players?: Array<{
      id: mongoose.Types.ObjectId;
      isGuest?: boolean;
    }>;
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
      default: "1v1",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bestOf: {
      type: Number,
      default: 3,
    },
    games: [
      {
        gameNumber: Number,
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending",
        },
        winner: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        stats: {
          team1: [
            {
              player: {
                type: Schema.Types.ObjectId,
                ref: "User",
              },
              isGuest: {
                type: Boolean,
                default: false,
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
              },
              isGuest: {
                type: Boolean,
                default: false,
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
        required: true,
      },
      isGuest: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
      players: [
        {
          id: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          isGuest: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    team2: {
      type: {
        type: String,
        enum: ["player", "team"],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      isGuest: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
      players: [
        {
          id: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          isGuest: {
            type: Boolean,
            default: false,
          },
        },
      ],
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

// Add indexes for better query performance
MatchSchema.index({ tournament: 1 });
MatchSchema.index({ round: 1 });
MatchSchema.index({ matchNumber: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ winner: 1 });

export const Match = mongoose.model<IMatch>("Match", MatchSchema);
