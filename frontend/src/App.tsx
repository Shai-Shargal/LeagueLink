import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useParams,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import FrontPage from "./ll-front-page/FrontPage";
import SignIn from "./ll-dashboard/SignIn";
import Register from "./ll-dashboard/Register";
import Dashboard from "./ll-dashboard/Dashboard";
import ProfileEditor from "./ll-dashboard/ProfileEditor";
import ViewTournamentInChannel from "./ll-tournament/components/ViewTournamentInChannel";
import ChannelView from "./ll-channels/ChannelView";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

// Channel View Wrapper
const ChannelViewWrapper = () => {
  const { channelId } = useParams();
  if (!channelId) return null;
  return <ChannelView channelId={channelId} />;
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
          <Route
            path="/dashboard/editprofile"
            element={
              <ProtectedRoute>
                <ProfileEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tournaments"
            element={
              <ProtectedRoute>
                <ViewTournamentInChannel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channel/:channelId"
            element={
              <ProtectedRoute>
                <ChannelViewWrapper />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
