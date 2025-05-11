import React from "react";
import { Box, Paper, Avatar, useTheme, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { Match, DraggableParticipant } from "../../types";

interface MatchBoxProps {
  match: Match;
  channelUsers: DraggableParticipant[];
  draggedParticipant: DraggableParticipant | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Match>) => void;
  parentWidth: number;
  parentHeight: number;
  isSourceMatch: boolean;
  onSelectAsSource: () => void;
}

const MATCH_BOX_WIDTH = 140;
const MATCH_BOX_HEIGHT = 60;
const PADDING = 16 * 2;

export const MatchBox: React.FC<MatchBoxProps> = ({
  match,
  draggedParticipant,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdate,
  parentWidth,
  parentHeight,
  isSourceMatch,
  onSelectAsSource,
}) => {
  const theme = useTheme();

  const renderParticipantBox = (
    participant: DraggableParticipant | null,
    color: string,
    isTeam1: boolean
  ) => {
    const textColor = theme.palette.getContrastText(color);
    return (
      <Box
        onDrop={(e) => {
          e.preventDefault();
          if (draggedParticipant) {
            onUpdate({ [isTeam1 ? "team1" : "team2"]: draggedParticipant });
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: participant ? "flex-start" : "center",
          backgroundColor: color,
          color: textColor,
          borderRadius: 2,
          p: 0.5,
          width: "100%",
          mb: 0.5,
          fontWeight: 600,
          fontSize: 13,
          opacity: participant ? 1 : 0.7,
          border: participant ? undefined : `2px dashed ${textColor}`,
          cursor: "pointer",
          minHeight: 28,
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.04)",
          },
        }}
      >
        {participant ? (
          <>
            <Avatar
              src={participant.profilePicture}
              alt={participant.username}
              sx={{
                width: 22,
                height: 22,
                mr: 1,
                border: `2px solid ${textColor}`,
              }}
            />
            <Box>{participant.username}</Box>
          </>
        ) : (
          <Box sx={{ fontStyle: "italic", fontSize: 14 }}>TBD</Box>
        )}
      </Box>
    );
  };

  let left = match.position.x - MATCH_BOX_WIDTH / 2;
  let top = match.position.y - MATCH_BOX_HEIGHT / 2;
  if (left < PADDING / 2) left = PADDING / 2;
  if (top < PADDING / 2) top = PADDING / 2;
  if (left + MATCH_BOX_WIDTH > parentWidth - PADDING / 2)
    left = parentWidth - PADDING / 2 - MATCH_BOX_WIDTH;
  if (top + MATCH_BOX_HEIGHT > parentHeight - PADDING / 2)
    top = parentHeight - PADDING / 2 - MATCH_BOX_HEIGHT;

  return (
    <Paper
      sx={{
        position: "absolute",
        left,
        top,
        minWidth: 340,
        maxWidth: 480,
        minHeight: 200,
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor:
          match.teamType === "team" ? "transparent" : "background.paper",
        transition: "transform 0.2s ease-in-out, border-color 0.3s ease",
        "&:hover": {
          transform: "scale(1.03)",
          borderColor: match.teamType === "team" ? "primary.main" : undefined,
        },
        border: isSourceMatch
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        zIndex: 10,
        cursor: "pointer",
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).closest("button")
        )
          return;
        onSelectAsSource();
      }}
    >
      {/* Trash icon at top right of the whole matchbox */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          p: 0.5,
          bgcolor: "rgba(0,0,0,0.08)",
          "&:hover": { bgcolor: "error.main", color: "#fff" },
        }}
        size="small"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      {match.teamType === "team" ? (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            borderRadius: 2,
            p: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: 2,
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            {/* Team 1 */}
            <Box
              sx={{
                flex: 1,
                background: "rgba(255,255,255,0.10)",
                borderRadius: 2,
                p: 1,
                minHeight: 100,
                boxShadow: 2,
                border: `2px solid ${theme.palette.primary.dark}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  mb: 0.5,
                  color: theme.palette.getContrastText(
                    theme.palette.primary.main
                  ),
                }}
              >
                Team 1
              </Box>
              <Box
                sx={{
                  width: "100%",
                  minHeight: 40,
                  border: `2px dashed ${theme.palette.primary.light}`,
                  borderRadius: 1,
                  p: 1,
                  mb: 1,
                  background: "rgba(255,255,255,0.10)",
                  transition: "background 0.2s",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!draggedParticipant) return;
                  const team1 = Array.isArray(match.team1) ? match.team1 : [];
                  const team2 = Array.isArray(match.team2) ? match.team2 : [];
                  if (
                    team1.find(
                      (p: any) => p.userId === draggedParticipant.userId
                    )
                  )
                    return;
                  if (
                    team2.find(
                      (p: any) => p.userId === draggedParticipant.userId
                    )
                  )
                    return;
                  onUpdate({ team1: [...team1, draggedParticipant] });
                }}
              >
                {Array.isArray(match.team1) && match.team1.length === 0 && (
                  <Box
                    sx={{
                      fontStyle: "italic",
                      fontSize: 13,
                      color: theme.palette.getContrastText(
                        theme.palette.primary.main
                      ),
                      opacity: 0.7,
                    }}
                  >
                    Drag players here
                  </Box>
                )}
                {Array.isArray(match.team1) &&
                  match.team1.map((p: any, idx: number) => (
                    <Box
                      key={p.userId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 0.5,
                        gap: 1,
                      }}
                    >
                      <Avatar
                        src={p.profilePicture}
                        alt={p.username}
                        sx={{
                          width: 22,
                          height: 22,
                          mr: 1,
                          border: `2px solid ${theme.palette.primary.dark}`,
                        }}
                      />
                      <Box
                        sx={{
                          color: theme.palette.getContrastText(
                            theme.palette.primary.main
                          ),
                          fontWeight: 500,
                        }}
                      >
                        {p.username}
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
            {/* Team 2 */}
            <Box
              sx={{
                flex: 1,
                background: "rgba(255,255,255,0.10)",
                borderRadius: 2,
                p: 1,
                minHeight: 100,
                boxShadow: 2,
                border: `2px solid ${theme.palette.secondary.dark}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  mb: 0.5,
                  color: theme.palette.getContrastText(
                    theme.palette.secondary.main
                  ),
                }}
              >
                Team 2
              </Box>
              <Box
                sx={{
                  width: "100%",
                  minHeight: 40,
                  border: `2px dashed ${theme.palette.secondary.light}`,
                  borderRadius: 1,
                  p: 1,
                  mb: 1,
                  background: "rgba(255,255,255,0.10)",
                  transition: "background 0.2s",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!draggedParticipant) return;
                  const team1 = Array.isArray(match.team1) ? match.team1 : [];
                  const team2 = Array.isArray(match.team2) ? match.team2 : [];
                  if (
                    team2.find(
                      (p: any) => p.userId === draggedParticipant.userId
                    )
                  )
                    return;
                  if (
                    team1.find(
                      (p: any) => p.userId === draggedParticipant.userId
                    )
                  )
                    return;
                  onUpdate({ team2: [...team2, draggedParticipant] });
                }}
              >
                {Array.isArray(match.team2) && match.team2.length === 0 && (
                  <Box
                    sx={{
                      fontStyle: "italic",
                      fontSize: 13,
                      color: theme.palette.getContrastText(
                        theme.palette.secondary.main
                      ),
                      opacity: 0.7,
                    }}
                  >
                    Drag players here
                  </Box>
                )}
                {Array.isArray(match.team2) &&
                  match.team2.map((p: any, idx: number) => (
                    <Box
                      key={p.userId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 0.5,
                        gap: 1,
                      }}
                    >
                      <Avatar
                        src={p.profilePicture}
                        alt={p.username}
                        sx={{
                          width: 22,
                          height: 22,
                          mr: 1,
                          border: `2px solid ${theme.palette.secondary.dark}`,
                        }}
                      />
                      <Box
                        sx={{
                          color: theme.palette.getContrastText(
                            theme.palette.secondary.main
                          ),
                          fontWeight: 500,
                        }}
                      >
                        {p.username}
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
          </Box>
          {/* Centered Best of input below both teams */}
          <Box
            sx={{
              mt: 2,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <label style={{ fontSize: 12, marginRight: 6, color: "#fff" }}>
              Best of
            </label>
            <input
              type="number"
              min={1}
              max={9}
              step={2}
              value={match.rounds || 3}
              style={{
                width: 40,
                textAlign: "center",
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 9) val = 9;
                if (val % 2 === 0) val = val - 1;
                onUpdate({ rounds: val });
              }}
            />
          </Box>
        </Box>
      ) : (
        <>
          {renderParticipantBox(
            match.team1 as DraggableParticipant | null,
            theme.palette.primary.main,
            true
          )}
          <Box
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              fontSize: 14,
              my: 0.5,
              textAlign: "center",
            }}
          >
            VS
          </Box>
          {renderParticipantBox(
            match.team2 as DraggableParticipant | null,
            theme.palette.secondary.main,
            false
          )}
          <Box
            sx={{
              mt: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <label style={{ fontSize: 12, marginRight: 6 }}>Best of</label>
            <input
              type="number"
              min={1}
              max={9}
              step={2}
              value={match.rounds || 3}
              style={{
                width: 40,
                textAlign: "center",
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 9) val = 9;
                if (val % 2 === 0) val = val - 1;
                onUpdate({ rounds: val });
              }}
            />
          </Box>
        </>
      )}
    </Paper>
  );
};
