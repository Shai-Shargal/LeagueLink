import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Match, DraggableParticipant } from "../../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (participant: DraggableParticipant) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
  parentWidth: number;
  parentHeight: number;
  isSourceMatch?: boolean;
  onSelectAsSource?: () => void;
  maxTeamSize?: number;
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 110;
const BORDER_RADIUS = 16;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  channelUsers,
  draggedParticipant,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdate,
  parentWidth,
  parentHeight,
  isSourceMatch,
  onSelectAsSource,
  maxTeamSize = 5,
}) => {
  const theme = useTheme();

  let left = match.position.x - CARD_WIDTH / 2;
  let top = match.position.y - CARD_HEIGHT / 2;
  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + CARD_WIDTH > parentWidth) left = parentWidth - CARD_WIDTH;
  if (top + CARD_HEIGHT > parentHeight) top = parentHeight - CARD_HEIGHT;

  // Helper to get participant info
  const getParticipant = (team: any) => {
    if (!team) return null;
    if (team.type === "team" && team.players && team.players.length > 0) {
      // Show first player as representative
      const user = channelUsers.find((u) => u.userId === team.players[0].id);
      return user || null;
    }
    if (team.type === "player") {
      return channelUsers.find((u) => u.userId === team.id) || null;
    }
    return null;
  };

  // Helper to get all participants for a team (for team matches)
  const getTeamParticipants = (team: any) => {
    if (!team || !team.players) return [];
    return team.players
      .map((p: any) => channelUsers.find((u) => u.userId === p.id))
      .filter(Boolean);
  };

  // Helper to check if a player is already in either team
  const isPlayerInTeams = (userId: string) => {
    const team1Players = match.team1?.players || [];
    const team2Players = match.team2?.players || [];
    return [...team1Players, ...team2Players].some((p) => p.id === userId);
  };

  const topParticipant = getParticipant(match.team1);
  const bottomParticipant = getParticipant(match.team2);

  // State to track which player is being dragged
  const [draggedPlayer, setDraggedPlayer] = React.useState<null | {
    userId: string;
    fromTeam: "team1" | "team2";
    matchId: string;
  }>(null);

  // Helper to handle player drag start
  const handlePlayerDragStart = (
    userId: string,
    fromTeam: "team1" | "team2"
  ) => {
    setDraggedPlayer({ userId, fromTeam, matchId: match.id });
  };

  // Helper to check if a team is full
  const isTeamFull = (team: any) => {
    return team?.players?.length >= maxTeamSize;
  };

  // Helper to handle player drop
  const handlePlayerDrop = (toTeam: "team1" | "team2") => {
    if (!draggedParticipant) return;

    // Check if team is full
    if (isTeamFull(match[toTeam])) {
      return;
    }

    // If dropping on the same team, do nothing
    if (
      draggedPlayer?.fromTeam === toTeam &&
      draggedPlayer?.matchId === match.id
    ) {
      return;
    }

    // Remove player from old team if exists
    const fromTeamPlayers = draggedPlayer?.fromTeam
      ? (match[draggedPlayer.fromTeam]?.players || []).filter(
          (p: any) => p.id !== draggedPlayer.userId
        )
      : [];

    // Add player to new team
    const toTeamPlayers = [
      ...(match[toTeam]?.players || []),
      {
        id: draggedParticipant.userId,
        isGuest: draggedParticipant.isGuest || false,
      },
    ];

    onUpdate({
      [toTeam]: {
        ...match[toTeam],
        type: "team",
        id: match[toTeam]?.id || "",
        isGuest: match[toTeam]?.isGuest || false,
        score: match[toTeam]?.score || 0,
        players: toTeamPlayers,
      },
      ...(draggedPlayer?.fromTeam && {
        [draggedPlayer.fromTeam]: {
          ...match[draggedPlayer.fromTeam],
          type: "team",
          id: match[draggedPlayer.fromTeam]?.id || "",
          isGuest: match[draggedPlayer.fromTeam]?.isGuest || false,
          score: match[draggedPlayer.fromTeam]?.score || 0,
          players: fromTeamPlayers,
        },
      }),
    });
    setDraggedPlayer(null);
  };

  // State for dragging the matchbox
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickStartTime, setClickStartTime] = React.useState<number | null>(
    null
  );

  // Mouse event handlers for moving the matchbox
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setClickStartTime(Date.now());
    setDragOffset({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    setDragOffset(null);

    // If the click duration was less than 200ms and there was no drag, delete the match
    if (clickStartTime && Date.now() - clickStartTime < 200 && !isDragging) {
      onDelete();
    }
    setClickStartTime(null);
  };

  React.useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragOffset) return;
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;
      onUpdate({
        position: {
          x: newLeft + CARD_WIDTH / 2,
          y: newTop + CARD_HEIGHT / 2,
        },
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragOffset(null);
      setClickStartTime(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, onUpdate]);

  // Team match rendering
  if (match.teamType === "team")
    return (
      <Paper
        sx={{
          position: "absolute",
          left,
          top,
          width: CARD_WIDTH * 1.5,
          height: CARD_HEIGHT * 1.5,
          borderRadius: 0,
          boxShadow: 4,
          background: "#23293a",
          border: isSourceMatch
            ? `2px solid ${theme.palette.primary.main}`
            : `2px solid #353b4b`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          p: 0,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={onSelectAsSource}
      >
        {/* Delete button */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            color: "#fff",
            "&:hover": {
              color: "error.main",
            },
            zIndex: 1,
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>

        {/* Team 1 pill */}
        <Box
          data-team="team1"
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedParticipant) return;
            if (isPlayerInTeams(draggedParticipant.userId)) return;
            if (isTeamFull(match.team1)) return;

            // Add player to team1
            onUpdate({
              team1: {
                ...match.team1,
                type: "team",
                id: match.team1?.id || "",
                isGuest: match.team1?.isGuest || false,
                score: match.team1?.score || 0,
                players: [
                  ...(match.team1?.players || []),
                  {
                    id: draggedParticipant.userId,
                    isGuest: draggedParticipant.isGuest || false,
                  },
                ],
              },
            });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedParticipant || isTeamFull(match.team1)) {
              e.dataTransfer.dropEffect = "none";
            }
          }}
          sx={{
            width: "80%",
            minHeight: 36,
            background:
              match.team1 &&
              match.team1.players &&
              match.team1.players.length > 0
                ? "#4f46e5"
                : "#23293a",
            color:
              match.team1 &&
              match.team1.players &&
              match.team1.players.length > 0
                ? "#fff"
                : "#bdbdbd",
            borderRadius: 99,
            border: "2px dashed",
            borderColor:
              match.team1 &&
              match.team1.players &&
              match.team1.players.length > 0
                ? "#a5b4fc"
                : "#bdbdbd",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            px: 1.2,
            py: 0.2,
            fontWeight: 700,
            mt: 1.2,
            mb: 0.5,
            gap: 1,
            overflowX: "auto",
            opacity: isTeamFull(match.team1) ? 0.5 : 1,
          }}
        >
          {match.team1?.players?.map((p: any) => {
            const user = channelUsers.find((u) => u.userId === p.id);
            if (!user) return null;
            return (
              <Box
                key={user.userId}
                draggable
                onDragStart={() => handlePlayerDragStart(user.userId, "team1")}
                onDragEnd={() => setDraggedPlayer(null)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 0.5,
                  cursor: "grab",
                }}
              >
                <Avatar
                  src={user.profilePicture}
                  sx={{ width: 28, height: 28, mr: 0.5 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: 70,
                  }}
                >
                  {user.username}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({
                      team1: {
                        ...match.team1,
                        type: "team",
                        id: match.team1?.id || "",
                        isGuest: match.team1?.isGuest || false,
                        score: match.team1?.score || 0,
                        players: (match.team1 && match.team1.players
                          ? match.team1.players
                          : []
                        ).filter((pp: any) => pp.id !== user.userId),
                      },
                    });
                  }}
                  sx={{ color: "#fff", p: 0.2 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
          {(!match.team1?.players || match.team1.players.length === 0) && (
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ color: "#a5b4fc", fontStyle: "italic", fontSize: 15 }}
            >
              TBD ({match.team1?.players?.length || 0}/{maxTeamSize})
            </Typography>
          )}
        </Box>

        {/* VS */}
        <Box
          sx={{ width: "100%", textAlign: "center", py: 0.1, minHeight: 18 }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ color: "#bdbdbd", letterSpacing: 2, fontSize: 16 }}
          >
            VS
          </Typography>
        </Box>

        {/* Team 2 pill */}
        <Box
          data-team="team2"
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedParticipant) return;
            if (isPlayerInTeams(draggedParticipant.userId)) return;
            if (isTeamFull(match.team2)) return;

            // Add player to team2
            onUpdate({
              team2: {
                ...match.team2,
                type: "team",
                id: match.team2?.id || "",
                isGuest: match.team2?.isGuest || false,
                score: match.team2?.score || 0,
                players: [
                  ...(match.team2?.players || []),
                  {
                    id: draggedParticipant.userId,
                    isGuest: draggedParticipant.isGuest || false,
                  },
                ],
              },
            });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedParticipant || isTeamFull(match.team2)) {
              e.dataTransfer.dropEffect = "none";
            }
          }}
          sx={{
            width: "80%",
            minHeight: 36,
            background:
              match.team2 &&
              match.team2.players &&
              match.team2.players.length > 0
                ? "#a21caf"
                : "#23293a",
            color:
              match.team2 &&
              match.team2.players &&
              match.team2.players.length > 0
                ? "#fff"
                : "#bdbdbd",
            borderRadius: 99,
            border: "2px dashed",
            borderColor:
              match.team2 &&
              match.team2.players &&
              match.team2.players.length > 0
                ? "#f0abfc"
                : "#bdbdbd",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            px: 1.2,
            py: 0.2,
            fontWeight: 700,
            mt: 0.5,
            mb: 1.2,
            gap: 1,
            overflowX: "auto",
            opacity: isTeamFull(match.team2) ? 0.5 : 1,
          }}
        >
          {match.team2?.players?.map((p: any) => {
            const user = channelUsers.find((u) => u.userId === p.id);
            if (!user) return null;
            return (
              <Box
                key={user.userId}
                draggable
                onDragStart={() => handlePlayerDragStart(user.userId, "team2")}
                onDragEnd={() => setDraggedPlayer(null)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 0.5,
                  cursor: "grab",
                }}
              >
                <Avatar
                  src={user.profilePicture}
                  sx={{ width: 28, height: 28, mr: 0.5 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: 70,
                  }}
                >
                  {user.username}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({
                      team2: {
                        ...match.team2,
                        type: "team",
                        id: match.team2?.id || "",
                        isGuest: match.team2?.isGuest || false,
                        score: match.team2?.score || 0,
                        players: (match.team2 && match.team2.players
                          ? match.team2.players
                          : []
                        ).filter((pp: any) => pp.id !== user.userId),
                      },
                    });
                  }}
                  sx={{ color: "#fff", p: 0.2 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
          {(!match.team2?.players || match.team2.players.length === 0) && (
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ color: "#f0abfc", fontStyle: "italic", fontSize: 15 }}
            >
              TBD ({match.team2?.players?.length || 0}/{maxTeamSize})
            </Typography>
          )}
        </Box>

        {/* Best of */}
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            py: 0.2,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ color: "#fff", fontSize: 14 }}>
            Best of
          </Typography>
          <select
            value={match.rounds || 3}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdate({ rounds: val });
            }}
            style={{
              width: 36,
              marginLeft: 4,
              borderRadius: 6,
              border: "1px solid #bdbdbd",
              background: "#23293a",
              color: "#fff",
              textAlign: "center",
              fontSize: 14,
              outline: "none",
              padding: "2px 0",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </Box>
      </Paper>
    );

  return (
    <Paper
      sx={{
        position: "absolute",
        left,
        top,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 0,
        boxShadow: 4,
        background: "#23293a",
        border: isSourceMatch
          ? `2px solid ${theme.palette.primary.main}`
          : `2px solid #353b4b`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        p: 0,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onSelectAsSource}
    >
      {/* Delete button */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          color: "#fff",
          "&:hover": {
            color: "error.main",
          },
          zIndex: 1,
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      {/* Top participant pill */}
      <Box
        data-team="team1"
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!draggedParticipant) return;
          onUpdate({
            team1: {
              type: "player",
              id: draggedParticipant.userId,
              isGuest: draggedParticipant.isGuest || false,
              score: 0,
            },
          });
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        sx={{
          width: "80%",
          minHeight: 26,
          background: topParticipant ? "#4f46e5" : "#23293a",
          color: topParticipant ? "#fff" : "#bdbdbd",
          borderRadius: 99,
          border: "2px dashed",
          borderColor: topParticipant ? "#a5b4fc" : "#bdbdbd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.2,
          py: 0.2,
          fontWeight: 700,
          mt: 1.2,
          mb: 0.5,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            color: topParticipant ? "#fff" : "#a5b4fc",
            fontStyle: "italic",
            fontSize: 13,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {topParticipant ? topParticipant.username : "TBD"}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({
              team1: null,
            });
          }}
          sx={{ color: topParticipant ? "#fff" : "#a5b4fc", p: 0.2 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* VS */}
      <Box sx={{ width: "100%", textAlign: "center", py: 0.1, minHeight: 14 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ color: "#bdbdbd", letterSpacing: 2, fontSize: 12 }}
        >
          VS
        </Typography>
      </Box>

      {/* Bottom participant pill */}
      <Box
        data-team="team2"
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!draggedParticipant) return;
          onUpdate({
            team2: {
              type: "player",
              id: draggedParticipant.userId,
              isGuest: draggedParticipant.isGuest || false,
              score: 0,
            },
          });
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        sx={{
          width: "80%",
          minHeight: 26,
          background: bottomParticipant ? "#a21caf" : "#23293a",
          color: bottomParticipant ? "#fff" : "#bdbdbd",
          borderRadius: 99,
          border: "2px dashed",
          borderColor: bottomParticipant ? "#f0abfc" : "#bdbdbd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.2,
          py: 0.2,
          fontWeight: 700,
          mt: 0.5,
          mb: 1.2,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            color: bottomParticipant ? "#fff" : "#f0abfc",
            fontStyle: "italic",
            fontSize: 13,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {bottomParticipant ? bottomParticipant.username : "TBD"}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({
              team2: null,
            });
          }}
          sx={{ color: bottomParticipant ? "#fff" : "#f0abfc", p: 0.2 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Best of */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 0.2,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "#fff", fontSize: 12 }}>
          Best of
        </Typography>
        <select
          value={match.rounds || 3}
          onChange={(e) => {
            const val = Number(e.target.value);
            onUpdate({ rounds: val });
          }}
          style={{
            width: 36,
            marginLeft: 4,
            borderRadius: 6,
            border: "1px solid #bdbdbd",
            background: "#23293a",
            color: "#fff",
            textAlign: "center",
            fontSize: 12,
            outline: "none",
            padding: "2px 0",
          }}
        >
          {[1, 3, 5, 7, 9].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </Box>
    </Paper>
  );
};

export default MatchBox;
