import React from "react";
import { Box, Button } from "@mui/material";

interface CreateTournamentBoxProps {
  onCreate?: () => void;
}

const CreateTournamentBox: React.FC<CreateTournamentBoxProps> = ({
  onCreate,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        p: 2,
        mt: 2,
        mb: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        sx={{ minWidth: 180, fontWeight: 600 }}
        onClick={onCreate}
      >
        Create Tournament
      </Button>
    </Box>
  );
};

export default CreateTournamentBox;
