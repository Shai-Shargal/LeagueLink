import mongoose from "mongoose";
import { IUser } from "./User.model.js";

export interface IChannel {
  name: string;
  description: string;
  passcode: string;
  image?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  tournaments: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: [3, "Channel name must be at least 3 characters long"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Channel description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    passcode: {
      type: String,
      required: [true, "Channel passcode is required"],
      trim: true,
      minlength: [6, "Passcode must be at least 6 characters long"],
    },
    image: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tournaments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
channelSchema.index({ name: 1 });
channelSchema.index({ owner: 1 });
channelSchema.index({ members: 1 });
channelSchema.index({ tournaments: 1 });

export const Channel = mongoose.model<IChannel>("Channel", channelSchema);
