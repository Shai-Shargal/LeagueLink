import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import FrontPage from "./ll-front-page/FrontPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        {/* Add additional routes here */}
      </Routes>
    </Router>
  );
}

export default App;
