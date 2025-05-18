import React, { useEffect, useState } from "react";
import { Match, BASE_BOX_WIDTH, BASE_BOX_HEIGHT } from "@/ll-tournament/types";
import { Box } from "@mui/material";

interface MatchConnectionsProps {
  matches: Match[];
}

// Constants for styling the connections
const CONNECTION_COLOR = "#9333EA";
const CONNECTION_WIDTH = 2;

export const MatchConnections: React.FC<MatchConnectionsProps> = ({
  matches,
}) => {
  const [connections, setConnections] = useState<
    Array<{
      start: Match;
      end: Match;
    }>
  >([]);

  useEffect(() => {
    // Create connections array from matches that have nextMatchId
    const newConnections = matches
      .filter((match) => match.nextMatchId)
      .map((match) => {
        const endMatch = matches.find((m) => m.id === match.nextMatchId);
        return endMatch ? { start: match, end: endMatch } : null;
      })
      .filter(Boolean) as Array<{ start: Match; end: Match }>;

    setConnections(newConnections);
  }, [matches]);

  const renderConnection = (
    startMatch: Match,
    endMatch: Match,
    index: number
  ) => {
    // Calculate positions
    const startX = startMatch.position.x + BASE_BOX_WIDTH / 2;
    const startY = startMatch.position.y + BASE_BOX_HEIGHT / 2;

    const endX = endMatch.position.x - BASE_BOX_WIDTH / 2;
    const endY = endMatch.position.y + BASE_BOX_HEIGHT / 2;

    // Determine if this is a connection from top to bottom (like in a bracket)
    const isTopToBottom = startY < endY;

    // Calculate the midpoint for the horizontal line
    const midX = startX + (endX - startX) / 2;

    // Generate a unique path ID
    const pathId = `path-${startMatch.id}-${endMatch.id}`;

    return (
      <Box
        key={`connection-${index}`}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", overflow: "visible" }}
        >
          <path
            id={pathId}
            d={`
              M ${startX} ${startY} 
              H ${midX} 
              V ${endY} 
              H ${endX}
            `}
            stroke={CONNECTION_COLOR}
            strokeWidth={CONNECTION_WIDTH}
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={CONNECTION_COLOR} />
            </marker>
          </defs>
        </svg>
      </Box>
    );
  };

  return (
    <>
      {connections.map((connection, index) =>
        renderConnection(connection.start, connection.end, index)
      )}
    </>
  );
};
