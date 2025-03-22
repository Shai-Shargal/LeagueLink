import React from "react";
import { Box } from "@mui/material";
import OurGoal from "./OurGoal";
import MeetTheTeam from "./MeetTheTeam";
import Body from "./Body";
import HeroSection from "../components/HeroSection";

const FrontPage: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <HeroSection />
      <Body />
      <OurGoal />
      <MeetTheTeam />
    </Box>
  );
};

export default FrontPage;
