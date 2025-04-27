import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";
import { ChannelUserStats } from "../types";

interface TournamentStatsTableProps {
  userStats: ChannelUserStats[];
  onUserClick: (userId: string) => void;
}

const TournamentStatsTable: React.FC<TournamentStatsTableProps> = ({
  userStats,
  onUserClick,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white", width: "40%" }}>Player</TableCell>
            <TableCell align="right" sx={{ color: "white" }}>
              Total Tournaments
            </TableCell>
            <TableCell align="right" sx={{ color: "white" }}>
              Wins
            </TableCell>
            <TableCell align="right" sx={{ color: "white" }}>
              Losses
            </TableCell>
            <TableCell align="right" sx={{ color: "white" }}>
              Win Rate
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userStats.map((player) => (
            <TableRow key={player.userId}>
              <TableCell
                sx={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1.5,
                }}
              >
                <Avatar
                  src={player.profilePicture}
                  alt={player.username}
                  onClick={() => onUserClick(player.userId)}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "rgba(198, 128, 227, 0.2)",
                    color: "white",
                    fontSize: "1rem",
                    border: "2px solid rgba(198, 128, 227, 0.3)",
                    boxShadow: "0 0 10px rgba(198, 128, 227, 0.1)",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.1)",
                      boxShadow: "0 0 15px rgba(198, 128, 227, 0.3)",
                      border: "2px solid rgba(198, 128, 227, 0.6)",
                    },
                  }}
                >
                  {player.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontWeight: 500 }}>
                  {player.username}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ color: "white" }}>
                {player.totalTournaments}
              </TableCell>
              <TableCell align="right" sx={{ color: "white" }}>
                {player.wins}
              </TableCell>
              <TableCell align="right" sx={{ color: "white" }}>
                {player.losses}
              </TableCell>
              <TableCell align="right" sx={{ color: "white" }}>
                {player.winRate}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TournamentStatsTable;
