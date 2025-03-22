import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { User } from "../dist/models/User.model.js";
import { Channel } from "../dist/models/Channel.model.js";
import { Tournament } from "../dist/models/Tournament.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/leaguelink";

const users = [
  {
    username: "admin",
    email: "admin@leaguelink.com",
    password: "Admin123!",
    isAdmin: true,
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "Password123!",
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "Password123!",
  },
];

const sports = ["Basketball", "Football", "Tennis", "Baseball", "Soccer"];

const channels = sports.map((sport) => ({
  name: `${sport} Community`,
  description: `Official channel for ${sport} enthusiasts`,
  sport,
  isPrivate: false,
}));

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Channel.deleteMany({}),
      Tournament.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword,
        });
      })
    );
    console.log("Created users");

    // Create channels
    const createdChannels = await Promise.all(
      channels.map(async (channel, index) => {
        const owner = createdUsers[index % createdUsers.length];
        return Channel.create({
          ...channel,
          owner: owner._id,
          admins: [owner._id],
          members: [owner._id],
        });
      })
    );
    console.log("Created channels");

    // Create tournaments
    const tournaments = createdChannels.map((channel, index) => ({
      name: `${channel.sport} Championship ${new Date().getFullYear()}`,
      description: `Annual ${channel.sport} tournament for all skill levels`,
      channel: channel._id,
      organizer: channel.owner,
      format: [
        "single_elimination",
        "double_elimination",
        "round_robin",
        "swiss",
      ][index % 4],
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxParticipants: 8,
      rules: "Standard tournament rules apply",
      prizes: "1st Place: Trophy, 2nd Place: Medal",
      participants: [channel.owner],
    }));

    await Tournament.create(tournaments);
    console.log("Created tournaments");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
