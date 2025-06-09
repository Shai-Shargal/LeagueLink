import React from "react";
import Xarrow from "react-xarrows";

interface Connection {
  start: string;
  end: string;
}

interface TournamentArrowsProps {
  connections: Connection[];
}

const TournamentArrows: React.FC<TournamentArrowsProps> = ({ connections }) => {
  return (
    <>
      {connections.map((connection, index) => (
        <Xarrow
          key={`${connection.start}-${connection.end}-${index}`}
          start={connection.start}
          end={connection.end}
          color="purple"
          strokeWidth={4}
          path="smooth"
          startAnchor="right"
          endAnchor="left"
          showHead={true}
          showTail={false}
          curveness={0.5}
          zIndex={1000}
          _debug={false}
          _extendSVGcanvas={3000}
        />
      ))}
    </>
  );
};

export default TournamentArrows;
