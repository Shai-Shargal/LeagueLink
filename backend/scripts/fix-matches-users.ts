import mongoose from "mongoose";
import { Match } from "../models/Match.model";
import { User } from "../models/User.model";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/league-link";

async function fixMatches() {
  await mongoose.connect(MONGO_URI);
  const matches = await Match.find({});
  let updated = 0;
  for (const match of matches) {
    let changed = false;
    // team1
    if (match.team1 && match.team1.id && !match.team1.username) {
      const user = await User.findById(match.team1.id);
      if (user) {
        match.team1.username = user.username;
        match.team1.profilePicture = user.profilePicture || "";
        changed = true;
      }
    }
    // team2
    if (match.team2 && match.team2.id && !match.team2.username) {
      const user = await User.findById(match.team2.id);
      if (user) {
        match.team2.username = user.username;
        match.team2.profilePicture = user.profilePicture || "";
        changed = true;
      }
    }
    if (changed) {
      await match.save();
      updated++;
    }
  }
  console.log(`Migration complete! Updated ${updated} matches.`);
  await mongoose.disconnect();
}

fixMatches().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
