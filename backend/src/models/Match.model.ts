import mongoose, { Schema, Document } from "mongoose";
import { ITournamentParticipant } from "./Tournament.model.js";

export interface IMatch extends Document {
  tournament: mongoose.Types.ObjectId;
  round: number;
  matchNumber: number;
  status: "pending" | "in_progress" | "completed";
  winner: mongoose.Types.ObjectId | null;
  bestOf: number;
  team1: {
    players: ITournamentParticipant[];
    score: number;
  };
  team2: {
    players: ITournamentParticipant[];
    score: number;
  };
  stats: Record<string, any>;
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
          userId: String,
          username: String,
          isGuest: Boolean,
          status: String,
        },
      ],
      score: {
        type: Number,
        default: 0,
      },
    },
    team2: {
      players: [
        {
          userId: String,
          username: String,
          isGuest: Boolean,
          status: String,
        },
      ],
      score: {
        type: Number,
        default: 0,
      },
    },
    stats: {
      type: Schema.Types.Mixed,
      default: {},
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
  if (this.team1.players.length === 0 || this.team2.players.length === 0) {
    next(new Error("Both teams must have at least one player"));
    return;
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
