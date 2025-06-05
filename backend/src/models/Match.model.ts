import mongoose, { Schema, Document } from "mongoose";

export interface ITeamPlayer {
  userId: mongoose.Types.ObjectId;
  username: string;
  profilePicture?: string;
}

export interface ITeam {
  players: ITeamPlayer[];
  score: number;
}

export interface IMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;
  team1: ITeam;
  team2: ITeam;
  bestOf: number;
  position: {
    x: number;
    y: number;
  };
  nextMatchId?: mongoose.Types.ObjectId;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  winner?: mongoose.Types.ObjectId;
  stats: Record<string, any>;
}

const matchSchema = new Schema<IMatch>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: [true, "Tournament ID is required"],
    },
    team1: {
      players: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          username: {
            type: String,
            required: true,
          },
          profilePicture: String,
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
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          username: {
            type: String,
            required: true,
          },
          profilePicture: String,
        },
      ],
      score: {
        type: Number,
        default: 0,
      },
    },
    bestOf: {
      type: Number,
      required: [true, "Best of is required"],
      enum: [1, 3, 5, 7, 9],
      default: 1,
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
    nextMatchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    stats: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
matchSchema.index({ tournamentId: 1 });
matchSchema.index({ nextMatchId: 1 });
matchSchema.index({ status: 1 });

export const Match = mongoose.model<IMatch>("Match", matchSchema);
