import "./Header.css";
import trophyIcon from "../assets/trophy-svgrepo-com (1).svg";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src={trophyIcon} alt="Trophy Icon" className="logo-icon" />
        <h1>LeagueLink</h1>
      </div>
      <nav>
        <ul>
          <li>
            <a href="#">Our Goal</a>
          </li>
          <li>
            <a href="#">Meet the Team</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
