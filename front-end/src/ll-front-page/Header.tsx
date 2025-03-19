import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <h1>LeagueLink</h1> {/* זה הלוגו שלך */}
      </div>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Download</a></li>
          <li><a href="#">Support</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;

