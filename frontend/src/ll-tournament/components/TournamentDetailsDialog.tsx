import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import TournamentToolbar from "./TournamentToolbar";
import TournamentUsers from "./TournamentUsers";
import { Tournament } from "../../services/tournamentService";

interface TournamentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: Omit<Tournament, "_id"> & { id: string };
}

const DroppableBox: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "matches-container",
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1.5,
        background: isOver
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.03)",
        borderRadius: 2,
        border: "1.5px dashed #444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: 1,
        minHeight: "40vh",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#666",
          background: "rgba(255,255,255,0.05)",
        },
      }}
    >
      <Typography>Drop matches here</Typography>
    </Box>
  );
};

const TournamentDetailsDialog: React.FC<TournamentDetailsDialogProps> = ({
  open,
  onClose,
  tournament,
}) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleCreateMatch = () => {
    console.log("Create match clicked");
  };

  const handleUndo = () => {
    console.log("Undo clicked");
  };

  const handleRedo = () => {
    console.log("Redo clicked");
  };

  const handleUserSelect = (user: any) => {
    console.log("User selected:", user);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      console.log("Dropped item:", active.id, "into:", over.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          color: "#fff",
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {tournament.name}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 3,
              height: "100%",
            }}
          >
            {/* Left side: Toolbar + Drop area */}
            <Box
              sx={{
                flex: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                <TournamentToolbar
                  onCreateMatch={handleCreateMatch}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </Box>

              <DroppableBox />
            </Box>

            {/* Right side: Users list */}
            <Box
              sx={{
                flex: 1,
                alignSelf: "flex-start",
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              <TournamentUsers
                channelId={tournament.channelId}
                onUserSelect={handleUserSelect}
              />
            </Box>
          </Box>
        </DndContext>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDetailsDialog;
