import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import FrontPage from "./ll-front-page/FrontPage";
import SignIn from "./ll-dashboard/SignIn";
import Register from "./ll-dashboard/Register";
import Dashboard from "./ll-dashboard/Dashboard";
import { authService } from "./services/api";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Add additional routes here */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
