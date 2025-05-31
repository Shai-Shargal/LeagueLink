import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TournamentCard from "./TournamentCard";

// Dummy type for now, can be replaced with real type from types/
interface Tournament {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

interface TournamentListProps {
  channelId: string;
}

const TournamentList: React.FC<TournamentListProps> = ({ channelId }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tournaments/channel/${channelId}`);
        const data = await res.json();
        if (data.success) {
          setTournaments(data.data);
        } else {
          setError("Failed to fetch tournaments");
        }
      } catch (err) {
        setError("Error fetching tournaments");
      } finally {
        setLoading(false);
      }
    };
    if (channelId) fetchTournaments();
  }, [channelId]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        p: 3,
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tournaments.length === 0 ? (
            <Card
              sx={{
                backgroundColor: "#232323",
                color: "#fff",
                border: "2px dashed #888",
                minHeight: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent sx={{ width: "100%", textAlign: "center" }}>
                <EmojiEventsIcon
                  sx={{ fontSize: 48, color: "#FFD700", mb: 1 }}
                />
                <Typography variant="h5" sx={{ color: "#bbb", mb: 1 }}>
                  No tournaments found in this channel
                </Typography>
                <Typography variant="body2" sx={{ color: "#888" }}>
                  When tournaments are created, they will appear here as cards.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            tournaments.map((tournament) => (
              <TournamentCard
                key={tournament._id}
                name={tournament.name}
                description={tournament.description}
                date={tournament.date}
                time={tournament.time}
                location={tournament.location}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default TournamentList;
