import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface TournamentCardProps {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  name,
  description,
  date,
  time,
  location,
}) => {
  return (
    <Card sx={{ backgroundColor: "#232323", color: "#fff" }}>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {description}
        </Typography>
        <Typography variant="caption">
          {date} | {time} | {location}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;
