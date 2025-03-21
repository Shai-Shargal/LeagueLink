import "./FrontPage.css";
import Header from "./Header";
import OurGoal from "./OurGoal";
import MeetTheTeam from "./MeetTheTeam";
import Body from "./Body";

function FrontPage() {
  return (
    <div className="front-page">
      <Header />
      <Body />
      <OurGoal />
      <MeetTheTeam />
    </div>
  );
}

export default FrontPage;
