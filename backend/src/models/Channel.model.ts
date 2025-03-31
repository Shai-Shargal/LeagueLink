import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.model.js";

export interface IChannel extends Document {
  name: string;
  description: string;
  passcode: string;
  image?: string;
  owner: IUser["_id"];
  members: IUser["_id"][];
  admins: IUser["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: [3, "Channel name must be at least 3 characters long"],
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
channelSchema.index({ name: 1 });
channelSchema.index({ owner: 1 });
channelSchema.index({ members: 1 });

export const Channel = mongoose.model<IChannel>("Channel", channelSchema);
