import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://cluster0.o7pra.mongodb.net/leaguelink";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Add your MongoDB credentials here
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASS,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
