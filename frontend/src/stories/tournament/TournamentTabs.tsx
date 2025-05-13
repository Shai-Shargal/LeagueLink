import React, { useState } from "react";
import { Tournament } from "../types";

interface TournamentTabsProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
}

const TournamentTabs: React.FC<TournamentTabsProps> = ({
  tournament,
  onUpdateTournament,
}) => {
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Tournament Info" },
    { id: "bracket", label: "Bracket" },
    { id: "participants", label: "Participants" },
    { id: "stats", label: "Statistics" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div style={{ padding: "20px" }}>
            <h3>Tournament Information</h3>
            <div style={{ marginTop: "10px" }}>
              <p>
                <strong>Name:</strong> {tournament.name}
              </p>
              <p>
                <strong>Status:</strong> {tournament.status}
              </p>
              <p>
                <strong>Format:</strong> {tournament.format}
              </p>
              <p>
                <strong>Location:</strong> {tournament.location}
              </p>
              <p>
                <strong>Date:</strong> {tournament.date}
              </p>
              <p>
                <strong>Time:</strong> {tournament.time}
              </p>
            </div>
          </div>
        );
      case "bracket":
        return (
          <div style={{ padding: "20px" }}>
            <h3>Tournament Bracket</h3>
            <p>Bracket visualization will be shown here</p>
          </div>
        );
      case "participants":
        return (
          <div style={{ padding: "20px" }}>
            <h3>Participants</h3>
            <div style={{ marginTop: "10px" }}>
              {tournament.participants.map((participant) => (
                <div key={participant.id} style={{ marginBottom: "10px" }}>
                  {participant.username}
                </div>
              ))}
            </div>
          </div>
        );
      case "stats":
        return (
          <div style={{ padding: "20px" }}>
            <h3>Statistics</h3>
            <div style={{ marginTop: "10px" }}>
              <p>
                <strong>Enabled Stats:</strong>
              </p>
              <ul>
                {tournament.statsConfig.enabledStats.map((stat) => (
                  <li key={stat}>{stat}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "800px" }}>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #ccc",
          marginBottom: "20px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #007bff" : "none",
              color: activeTab === tab.id ? "#007bff" : "#666",
              fontWeight: activeTab === tab.id ? "bold" : "normal",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderTabContent()}
    </div>
  );
};

export default TournamentTabs;
