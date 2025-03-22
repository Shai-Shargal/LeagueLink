import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI);
    logger.info("MongoDB Connected Successfully");
  } catch (error) {
    logger.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
