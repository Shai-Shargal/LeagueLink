import React from "react";
import { Tournament, Match } from "../types";
import TournamentBracket from "./TournamentBracket";

interface TournamentBracketSectionProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
  onUpdateMatch: (match: Match) => Promise<void>;
}

const TournamentBracketSection: React.FC<TournamentBracketSectionProps> = ({
  tournament,
  onUpdateTournament,
  onUpdateMatch,
}) => {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: "#333" }}>
          {tournament.name} - Bracket
        </h2>
        <div
          style={{
            padding: "6px 12px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          Status: {tournament.status}
        </div>
      </div>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <TournamentBracket
          tournament={tournament}
          onUpdateTournament={onUpdateTournament}
          onUpdateMatch={onUpdateMatch}
        />
      </div>
    </div>
  );
};

export default TournamentBracketSection;
