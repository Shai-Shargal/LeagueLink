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

// Add a pre-save hook to validate team matches
MatchSchema.pre("save", function (next) {
  if (this.teamType === "team") {
    if (!this.team1.players || !this.team2.players) {
      next(new Error("Team matches must have players arrays"));
      return;
    }
    if (this.team1.players.length === 0 || this.team2.players.length === 0) {
      next(new Error("Team matches must have at least one player per team"));
      return;
    }
  }
  next();
});

// Add a pre-delete hook to handle cleanup
MatchSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      // Find all matches that reference this match as their nextMatch
      const matchesToUpdate = await this.model("Match").find({
        nextMatch: this._id,
      });

      // Update those matches to remove the reference
      if (matchesToUpdate.length > 0) {
        await this.model("Match").updateMany(
          { nextMatch: this._id },
          { $set: { nextMatch: null } }
        );
      }

      // Remove match from tournament
      await this.model("Tournament").findByIdAndUpdate(this.tournament, {
        $pull: { matches: this._id },
      });

      next();
    } catch (error: any) {
      next(error as Error);
    }
  }
);

export const Match = mongoose.model<IMatch>("Match", MatchSchema);
