
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <div className="logo">
          <h1>LeagueLink</h1>
        </div>
        <nav>
          <ul>
            <li><a href="#">Features</a></li>
            <li><a href="#">Download</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <h1>Welcome to LeagueLink</h1>
        <p>Shai</p>
        <button className="cta">Start Here</button>
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
          <p>LeagueLink is free and always will be, with no ads or premium-only features.</p>
        </div>
      </section>

      <footer>
        <div className="social-media">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
        <p>&copy; 2025 LeagueLink Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
