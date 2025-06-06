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

const TournamentDropZone: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Add new connection
      setConnections((prev) => [
        ...prev,
        {
          start: active.id as string,
          end: over.id as string,
        },
      ]);
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
            <MatchBox key={match.id} id={match.id} position={match.position} />
          ))}

          {connections.map((connection, index) => (
            <Xarrow
              key={index}
              start={connection.start}
              end={connection.end}
              color="#2196f3"
              strokeWidth={2}
              path="grid"
              startAnchor="right"
              endAnchor="left"
            />
          ))}
        </Xwrapper>
      </DndContext>
    </Box>
  );
};

export default TournamentDropZone;
