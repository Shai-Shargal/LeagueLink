import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import FrontPage from './ll-front-page/FrontPage';
import Header from './ll-front-page/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<FrontPage />} />
        {/* תוכל להוסיף כאן דפים נוספים, לדוגמה: */}
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
