import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
} from "@dnd-kit/core";
import { Box } from "@mui/material";
import Xarrow, { Xwrapper } from "react-xarrows";
import MatchBox from "./matchbox";

interface Match {
  id: string;
  position: { x: number; y: number };
}

interface Connection {
  start: string;
  end: string;
}

interface TournamentDropZoneProps {
  matches: Match[];
  onMatchAdd: (match: Match) => void;
  onMatchRemove: (matchId: string) => void;
  onConnectionAdd: (connection: Connection) => void;
}

const TournamentDropZone: React.FC<TournamentDropZoneProps> = ({
  matches,
  onMatchAdd,
  onMatchRemove,
  onConnectionAdd,
}) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // If dropped in empty space, add new match
      if (active.data.current?.type === "matchbox") {
        onMatchAdd({
          id: active.id as string,
          position: { x: event.delta.x, y: event.delta.y },
        });
      }
      return;
    }

    // If dropped on another match, create connection
    if (active.id !== over.id) {
      onConnectionAdd({
        start: active.id as string,
        end: over.id as string,
      });
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
      }}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Xwrapper>
          {matches.map((match) => (
            <MatchBox
              key={match.id}
              id={match.id}
              position={match.position}
              onRemove={() => onMatchRemove(match.id)}
            />
          ))}
        </Xwrapper>
      </DndContext>
    </Box>
  );
};

export default TournamentDropZone;
