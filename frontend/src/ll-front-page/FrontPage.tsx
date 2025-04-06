import React, { useRef } from "react";
import { Box } from "@mui/material";
import HeroSection from "./HeroSection";
import OurGoal from "./OurGoal";
import MeetTheTeam from "./MeetTheTeam";

const FrontPage: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  return (
    <Box sx={{ width: "100%" }}>
      <HeroSection />
      <Box ref={aboutRef}>
        <OurGoal />
      </Box>
      <Box ref={contactRef}>
        <MeetTheTeam />
      </Box>
    </Box>
  );
};

export default FrontPage;
