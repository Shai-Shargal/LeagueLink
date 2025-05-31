import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import TournamentList from "./TournamentList";
import CreateTournamentBox from "./CreateTournamentBox";
import CreateTournamentDialog, {
  TournamentFormData,
} from "./CreateTournamentDialog";

const ViewTournamentInChannel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const channelId =
    searchParams.get("channel") || location.pathname.split("/").pop();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0); // for refreshing TournamentList

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleCreateTournament = async (data: TournamentFormData) => {
    if (!channelId) return;
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          channelId,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setRefreshKey((k) => k + 1); // trigger TournamentList refresh
        handleCloseDialog();
      } else {
        alert(result.error || "Failed to create tournament");
      }
    } catch (err) {
      alert("Error creating tournament");
    }
  };

  const handleBackToChannel = () => {
    navigate(`/channel/${channelId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        position: "relative",
        alignItems: "flex-start",
        gap: 3,
        p: 3,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <CreateTournamentDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onCreate={handleCreateTournament}
        />
        {channelId && <TournamentList key={refreshKey} channelId={channelId} />}
      </Box>
      <Box sx={{ minWidth: 220, maxWidth: 300, flexShrink: 0 }}>
        <CreateTournamentBox onCreate={handleOpenDialog} />
      </Box>
    </Box>
  );
};

export default ViewTournamentInChannel;
