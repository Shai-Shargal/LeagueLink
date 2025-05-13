import React from "react";
import { Box, Tabs, Tab, Button } from "@mui/material";
import {
  EmojiEvents as TournamentIcon,
  BarChart as StatsIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Tournament, ChannelUserStats } from "../types";
import TournamentStatsTable from "./ViewStats/TournamentStatsTable";
import TournamentList from "./ViewTournament/TournamentList";

interface TournamentTabsProps {
  activeTab: number;
  setActiveTab: (value: number) => void;
  userStats: ChannelUserStats[];
  tournaments: Tournament[];
  isAdmin: boolean;
  onUserClick: (userId: string) => void;
  onTournamentClick: (tournament: Tournament) => void;
  onDeleteTournament: (tournament: Tournament) => void;
  onCreateTournament: () => void;
}

const TournamentTabs: React.FC<TournamentTabsProps> = ({
  activeTab,
  setActiveTab,
  userStats,
  tournaments,
  isAdmin,
  onUserClick,
  onTournamentClick,
  onDeleteTournament,
  onCreateTournament,
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 3,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_event, newValue) => setActiveTab(newValue)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Statistics" icon={<StatsIcon />} iconPosition="start" />
          <Tab
            label="Tournaments"
            icon={<TournamentIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <TournamentStatsTable userStats={userStats} onUserClick={onUserClick} />
      )}

      {activeTab === 1 && (
        <Box>
          <TournamentList
            tournaments={tournaments}
            onTournamentClick={onTournamentClick}
            onDeleteTournament={onDeleteTournament}
            onCreateTournament={onCreateTournament}
            isAdmin={isAdmin}
          />
        </Box>
      )}

      {/* Floating Create Tournament Button at bottom right */}
      {activeTab === 1 && isAdmin && (
        <Box
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTournament}
            sx={{
              background: "linear-gradient(45deg, #C680E3, #9333EA)",
              color: "#fff",
              fontWeight: 600,
              boxShadow: 6,
              borderRadius: 3,
              px: 4,
              py: 2,
              minWidth: 0,
              minHeight: 0,
              fontSize: "1.1rem",
              "&:hover": {
                background: "linear-gradient(45deg, #9333EA, #7928CA)",
              },
            }}
          >
            Create Tournament
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TournamentTabs;
