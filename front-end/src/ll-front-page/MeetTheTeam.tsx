import "./MeetTheTeam.css";
import shaiShargalPic from "../assets/ShaiSharglPicture.svg";

function MeetTheTeam() {
  return (
    <section id="meet-the-team" className="meet-the-team">
      <h2>Meet the Team</h2>
      <div className="team-member">
        <img
          src={shaiShargalPic}
          alt="Shai Shargal"
          className="team-member-pic"
        />
        <h3>Shai Shargal</h3>
        <p>Full Stack Developer</p>
      </div>
    </section>
  );
}

export default MeetTheTeam;
