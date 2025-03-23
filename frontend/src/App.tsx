import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import FrontPage from "./ll-front-page/FrontPage";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import "./App.css";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          {/* Add additional routes here */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
