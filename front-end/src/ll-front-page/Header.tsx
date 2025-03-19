import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src="/path/to/trophy-icon.svg" alt="Trophy Icon" className="logo-icon" />
        <h1>LeagueLink</h1>
      </div>
      <nav>
        <ul>
          <li><a href="#">Who We Are</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;

