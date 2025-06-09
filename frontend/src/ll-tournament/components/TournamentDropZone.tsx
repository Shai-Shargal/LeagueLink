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
import TournamentArrows from "./TournamentArrows";

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
  _id?: string;
  stats?: Record<string, number>;
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
  isFetching?: boolean;
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
  isFetching = false,
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

  const handleMatchClick = (match: Match) => {
    if (!selectedMatch) {
      // First match selection
      setSelectedMatch(match.id);
    } else if (selectedMatch !== match.id) {
      // Second match selection - create connection
      const newConnection = {
        start: selectedMatch,
        end: match.id,
      };

      onConnectionAdd(newConnection);
      setSelectedMatch(null);
    } else {
      // Clicking the same match - deselect
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
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: 3,
        p: 3,
        overflow: "visible",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        backdropFilter: "blur(10px)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, rgba(33,150,243,0.1), rgba(33,150,243,0))",
          borderRadius: 3,
          pointerEvents: "none",
        },
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
                tournamentUsers={tournamentUsers}
                tournamentId={tournamentId}
                round={match.round}
                matchNumber={match.matchNumber}
                onRemove={() => onMatchRemove(match.id)}
                onClick={() => handleMatchClick(match)}
                isSelected={selectedMatch === match.id}
                isFetching={isFetching}
                initialData={
                  match._id
                    ? {
                        team1: match.team1,
                        team2: match.team2,
                        bestOf: match.bestOf,
                        status: match.status,
                        gameScores: match.gameScores,
                        _id: match._id,
                      }
                    : undefined
                }
              />
            ))}

            <TournamentArrows connections={connections} />
          </Box>
        </Xwrapper>
      </DndContext>
    </Box>
  );
};

export default TournamentDropZone;
