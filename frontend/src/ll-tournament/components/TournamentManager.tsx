import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import TournamentToolbar from "./TournamentToolbar";
import MatchBox from "./matchbox";
import { authService } from "../../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isGuest?: boolean;
}

interface TournamentManagerProps {
  channelId: string;
}

const TournamentManager: React.FC<TournamentManagerProps> = ({ channelId }) => {
  const [matches, setMatches] = useState<number[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.getChannel(channelId);
        setUsers(
          response.data.members.map((member: any) => ({
            id: member._id,
            name: member.username,
            email: member.email || "",
            avatar: member.profilePicture || null,
            isGuest: false,
          }))
        );
      } catch (err) {
        setError("Failed to fetch channel members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchUsers();
    }
  }, [channelId]);

  const handleCreateMatch = () => {
    setMatches((prev) => [...prev, Date.now()]); // Using timestamp as unique ID
    setCanUndo(true);
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality
    setCanUndo(false);
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    setCanRedo(false);
  };

  if (loading) {
    return <Box sx={{ p: 2 }}>Loading users...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 2 }}>Error loading users: {error}</Box>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <TournamentToolbar
        onCreateMatch={handleCreateMatch}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mt: 2,
        }}
      >
        {matches.map((matchId) => (
          <MatchBox key={matchId} tournamentUsers={users} />
        ))}
      </Box>
    </Box>
  );
};

export default TournamentManager;
