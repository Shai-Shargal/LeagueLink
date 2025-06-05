import React, { useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Delete, Close } from "@mui/icons-material";

interface User {
  id: string;
  name: string;
}

interface TeamSlotProps {
  id: string;
  teamColor: string;
  title: string;
  players: User[];
  onRemovePlayer: (id: string) => void;
}

const TeamSlot: React.FC<TeamSlotProps> = ({
  id,
  teamColor,
  players,
  onRemovePlayer,
  title,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 32,
        borderRadius: 1,
        border: "1px dashed #aaa",
        backgroundColor: isOver ? "#444" : teamColor,
        px: 0.75,
        py: 0.25,
        mb: 0.25,
      }}
    >
      <Typography fontSize={10} fontWeight={600} color="#fff" mb={0.25}>
        {title}
      </Typography>

      {players.length === 0 && (
        <Typography fontSize={9} fontStyle="italic" color="#ddd">
          TBD
        </Typography>
      )}

      {players.map((p) => (
        <Box
          key={p.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 0.5,
            px: 0.5,
            py: 0.25,
            mt: 0.25,
            color: "#fff",
            fontSize: 9,
          }}
        >
          <span>{p.name}</span>
          <IconButton
            size="small"
            onClick={() => onRemovePlayer(p.id)}
            sx={{ p: 0.25 }}
          >
            <Delete fontSize="small" sx={{ color: "#fff", fontSize: 12 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

interface MatchBoxProps {
  id?: string;
  onRemove?: () => void;
}

const MatchBox: React.FC<MatchBoxProps> = ({ id = "matchbox", onRemove }) => {
  const [team1, setTeam1] = useState<User[]>([]);
  const [team2, setTeam2] = useState<User[]>([]);
  const [bestOf, setBestOf] = useState<number>(3);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const isInAnyTeam = (id: string) =>
    team1.some((u) => u.id === id) || team2.some((u) => u.id === id);

  const handleDragEnd = (event: any) => {
    const draggedId = String(event.active.id);
    const target = event.over?.id;
    const draggedName = event.active?.data?.current?.name || "Unknown";

    if (!draggedId || !target || isInAnyTeam(draggedId)) return;

    const user: User = { id: draggedId, name: draggedName };

    if (target === "team1") setTeam1((prev) => [...prev, user]);
    else if (target === "team2") setTeam2((prev) => [...prev, user]);
  };

  const removeFromTeam1 = (id: string) =>
    setTeam1((prev) => prev.filter((u) => u.id !== id));
  const removeFromTeam2 = (id: string) =>
    setTeam2((prev) => prev.filter((u) => u.id !== id));

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        backgroundColor: "#1a1a2e",
        p: 0.75,
        borderRadius: 1,
        width: 140,
        cursor: "grab",
        position: "relative",
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: -6,
          right: -6,
          backgroundColor: "#ff4444",
          color: "#fff",
          width: 16,
          height: 16,
          minWidth: 16,
          "&:hover": {
            backgroundColor: "#cc0000",
          },
          "& .MuiSvgIcon-root": {
            fontSize: 12,
          },
        }}
      >
        <Close />
      </IconButton>

      <TeamSlot
        id="team1"
        teamColor="#3f51b5"
        title="Team 1"
        players={team1}
        onRemovePlayer={removeFromTeam1}
      />

      <Typography
        sx={{
          textAlign: "center",
          color: "#aaa",
          fontSize: 10,
          my: 0.25,
          fontWeight: 500,
        }}
      >
        VS
      </Typography>

      <TeamSlot
        id="team2"
        teamColor="#d81b60"
        title="Team 2"
        players={team2}
        onRemovePlayer={removeFromTeam2}
      />

      <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.25 }}>
        <Typography sx={{ color: "#fff", fontSize: 10 }}>BO</Typography>
        <TextField
          type="number"
          value={bestOf}
          onChange={(e) => setBestOf(Number(e.target.value))}
          inputProps={{ min: 1, max: 9 }}
          sx={{
            input: {
              backgroundColor: "#fff",
              width: 24,
              p: 0.25,
              fontSize: 10,
              textAlign: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default MatchBox;
