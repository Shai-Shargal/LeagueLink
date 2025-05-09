import React, { useRef, useEffect, useState } from "react";
import Xarrow from "react-xarrows";
import { Match } from "../../types";

interface MatchConnectionsProps {
  matches: Match[];
}

export const MatchConnections: React.FC<MatchConnectionsProps> = ({
  matches,
}) => {
  const [connections, setConnections] = useState<
    Array<{ start: string; end: string }>
  >([]);

  useEffect(() => {
    const newConnections = matches
      .filter((match) => match.nextMatchId)
      .map((match) => ({
        start: `match-${match.id}`,
        end: `match-${match.nextMatchId}`,
      }));
    setConnections(newConnections);
  }, [matches]);

  return (
    <>
      {connections.map(({ start, end }) => (
        <Xarrow
          key={`${start}-${end}`}
          start={start}
          end={end}
          color="#9333EA"
          strokeWidth={2}
          path="grid"
          startAnchor="right"
          endAnchor="left"
          showHead
          headSize={6}
          curveness={0.5}
        />
      ))}
    </>
  );
};
