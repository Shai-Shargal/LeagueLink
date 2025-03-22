import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import FrontPage from "./ll-front-page/FrontPage";
import "./App.css";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          {/* Add additional routes here */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
