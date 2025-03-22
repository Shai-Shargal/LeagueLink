import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.model.js";

export interface IChannel extends Document {
  name: string;
  description: string;
  sport: string;
  isPrivate: boolean;
  owner: IUser["_id"];
  admins: IUser["_id"][];
  members: IUser["_id"][];
  tournaments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    sport: {
      type: String,
      required: true,
      trim: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
channelSchema.index({ name: 1 });
channelSchema.index({ sport: 1 });
channelSchema.index({ owner: 1 });

const Channel = mongoose.model<IChannel>("Channel", channelSchema);
export { Channel };
