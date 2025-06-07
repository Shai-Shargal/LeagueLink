import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
} from "@dnd-kit/core";
import { Box } from "@mui/material";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";
import MatchBox from "./matchbox";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isGuest?: boolean;
}

interface Match {
  id: string;
  position: { x: number; y: number };
  round: number;
  matchNumber: number;
  team1: {
    players: Array<{
      userId: string;
      username: string;
      profilePicture?: string;
    }>;
    score: number;
  };
  team2: {
    players: Array<{
      userId: string;
      username: string;
      profilePicture?: string;
    }>;
    score: number;
  };
  bestOf: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  gameScores: Array<{
    team1Score: number;
    team2Score: number;
  }>;
}

interface Connection {
  start: string;
  end: string;
}

interface TournamentDropZoneProps {
  matches: Match[];
  tournamentUsers: User[];
  tournamentId: string;
  onMatchAdd: (match: Match) => void;
  onMatchRemove: (matchId: string) => void;
  onConnectionAdd: (connection: Connection) => void;
  onMatchMove: (matchId: string, position: { x: number; y: number }) => void;
  connections: Connection[];
}

const TournamentDropZone: React.FC<TournamentDropZoneProps> = ({
  matches,
  tournamentUsers,
  tournamentId,
  onMatchAdd,
  onMatchRemove,
  onConnectionAdd,
  onMatchMove,
  connections,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const updateXarrow = useXarrow();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    // If it's an existing match being moved
    if (matches.some((match) => match.id === active.id)) {
      const match = matches.find((m) => m.id === active.id);
      if (match) {
        onMatchMove(match.id, {
          x: match.position.x + delta.x,
          y: match.position.y + delta.y,
        });
      }
      return;
    }

    // If it's a new match being dropped
    if (!over && active.data.current?.type === "matchbox") {
      const round = Math.floor(matches.length / 2) + 1;
      const matchNumber = matches.length + 1;
      onMatchAdd({
        id: active.id as string,
        position: { x: delta.x, y: delta.y },
        round,
        matchNumber,
        team1: { players: [], score: 0 },
        team2: { players: [], score: 0 },
        bestOf: 3,
        status: "PENDING",
        gameScores: [],
      });
    }
  };

  const handleMatchClick = (matchId: string) => {
    console.log(
      "Clicked match:",
      matchId,
      "Currently selected:",
      selectedMatch
    );

    if (!selectedMatch) {
      // First match selection
      setSelectedMatch(matchId);
      console.log("Selected first match:", matchId);
    } else if (selectedMatch !== matchId) {
      // Second match selection - create connection
      console.log(
        "Creating connection between:",
        selectedMatch,
        "and",
        matchId
      );

      const newConnection = {
        start: selectedMatch,
        end: matchId,
      };

      // Check if connection already exists (in either direction)
      const connectionExists = connections.some((conn) => {
        const isDirectMatch =
          conn.start === newConnection.start && conn.end === newConnection.end;
        const isReverseMatch =
          conn.start === newConnection.end && conn.end === newConnection.start;
        return isDirectMatch || isReverseMatch;
      });

      if (!connectionExists) {
        console.log("Adding new connection");
        onConnectionAdd(newConnection);
      } else {
        console.log("Connection already exists");
      }

      // Reset selection after creating connection
      setSelectedMatch(null);
    } else {
      // Clicking the same match - deselect
      console.log("Deselecting match:", matchId);
      setSelectedMatch(null);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "500px",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        p: 2,
        overflow: "visible",
      }}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Xwrapper>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "visible",
              "& svg": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1000,
              },
            }}
          >
            {matches.map((match) => (
              <MatchBox
                key={match.id}
                id={match.id}
                position={match.position}
                onRemove={() => onMatchRemove(match.id)}
                onClick={() => handleMatchClick(match.id)}
                isSelected={match.id === selectedMatch}
                tournamentUsers={tournamentUsers}
                tournamentId={tournamentId}
                round={match.round}
                matchNumber={match.matchNumber}
              />
            ))}

            {connections.map((connection, index) => {
              console.log("Rendering Xarrow:", {
                start: connection.start,
                end: connection.end,
                startElement: document.getElementById(connection.start),
                endElement: document.getElementById(connection.end),
              });
              return (
                <Xarrow
                  key={`${connection.start}-${connection.end}-${index}`}
                  start={connection.start}
                  end={connection.end}
                  color="rgba(76, 175, 80, 0.8)"
                  strokeWidth={3}
                  path="grid"
                  startAnchor="right"
                  endAnchor="left"
                  showHead={true}
                  showTail={true}
                  gridBreak="0%"
                  curveness={0.5}
                  zIndex={1000}
                  _debug={true}
                  _extendSVGcanvas={1000}
                  labels={{
                    middle: (
                      <div
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        →
                      </div>
                    ),
                  }}
                />
              );
            })}
          </Box>
        </Xwrapper>
      </DndContext>
    </Box>
  );
};

export default TournamentDropZone;
