import mongoose, { Schema, Document } from "mongoose";

export interface ITournament extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "active" | "completed";
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    participants: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITournament>("Tournament", TournamentSchema);
