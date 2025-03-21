import "./Body.css";
import StartHere from "./StartHere";

function Body() {
  return (
    <div className="body">
      <section className="hero">
        <h1>Welcome to LeagueLink</h1>
        <p>Connecting Communities, Competing Together</p>
        <StartHere />
      </section>
      <section className="features">
        <div className="feature">
          <h2>High-quality Voice</h2>
          <p>Crystal-clear voice, video, and text communication with no lag.</p>
        </div>
        <div className="feature">
          <h2>Community</h2>
          <p>Join millions of people in any server, or create your own.</p>
        </div>
        <div className="feature">
          <h2>Free Forever</h2>
          <p>
            LeagueLink is free and always will be, with no ads or premium-only
            features.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Body;
