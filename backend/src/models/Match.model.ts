import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  tournament: mongoose.Types.ObjectId;
  round: number;
  matchNumber: number;
  position: {
    x: number;
    y: number;
  };
  bestOf: number;
  team1: {
    players: Array<{
      userId: string;
      username: string;
    }>;
    isGuest: boolean;
    score: number;
  };
  team2: {
    players: Array<{
      userId: string;
      username: string;
    }>;
    isGuest: boolean;
    score: number;
  };
  nextMatchId: mongoose.Types.ObjectId | null;
  stats: {
    scores?: Array<{
      team1: number;
      team2: number;
    }>;
    [key: string]: any;
  };
  status: "pending" | "in_progress" | "completed";
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
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    bestOf: {
      type: Number,
      required: true,
      validate: {
        validator: function (v: number) {
          return v % 2 === 1 && v >= 1;
        },
        message: (props) =>
          `${props.value} is not a valid bestOf value. Must be an odd number greater than or equal to 1.`,
      },
    },
    team1: {
      players: [
        {
          userId: {
            type: String,
            required: true,
          },
          username: {
            type: String,
            required: true,
          },
        },
      ],
      isGuest: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    team2: {
      players: [
        {
          userId: {
            type: String,
            required: true,
          },
          username: {
            type: String,
            required: true,
          },
        },
      ],
      isGuest: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    nextMatchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
    stats: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
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
MatchSchema.index({ nextMatchId: 1 });

// Add a pre-delete hook to handle cleanup
MatchSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      // Find all matches that reference this match as their nextMatchId
      const matchesToUpdate = await this.model("Match").find({
        nextMatchId: this._id,
      });

      // Update those matches to remove the reference
      if (matchesToUpdate.length > 0) {
        await this.model("Match").updateMany(
          { nextMatchId: this._id },
          { $set: { nextMatchId: null } }
        );
      }

      next();
    } catch (error: any) {
      next(error as Error);
    }
  }
);

export const Match = mongoose.model<IMatch>("Match", MatchSchema);
