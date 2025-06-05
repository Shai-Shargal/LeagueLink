import React, { useState } from "react";
import { Box } from "@mui/material";
import TournamentToolbar from "./TournamentToolbar";
import MatchBox from "./matchbox";

const TournamentManager: React.FC = () => {
  const [matches, setMatches] = useState<number[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
          <MatchBox key={matchId} />
        ))}
      </Box>
    </Box>
  );
};

export default TournamentManager;
