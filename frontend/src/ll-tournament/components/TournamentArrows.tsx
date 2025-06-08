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
          color="#9c27b0"
          strokeWidth={4}
          path="straight"
          startAnchor={{ position: "right", offset: { y: 0 } }}
          endAnchor={{ position: "left", offset: { y: 0 } }}
          showHead={false}
          showTail={false}
          curveness={0}
          zIndex={1000}
          _debug={false}
          _extendSVGcanvas={3000}
          labels={{
            middle: (
              <div
                style={{
                  backgroundColor: "#e1bee7",
                  color: "#6a1b9a",
                  border: "1px solid #6a1b9a",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  boxShadow: "0 0 6px rgba(106,27,154,0.15)",
                }}
              />
            ),
          }}
        />
      ))}
    </>
  );
};

export default TournamentArrows;
