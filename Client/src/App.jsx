import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import DashboardLayout from "./components/DashboardLayout";
import LoadingScreen from "./components/LoadingScreen";
import { useAuth } from "./hooks/useAuth";
import EntryPage from "./pages/EntryPage";
import ExitPage from "./pages/ExitPage";
import FreeSlotsPage from "./pages/FreeSlotsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LogsPage from "./pages/LogsPage";
import OccupiedSlotsPage from "./pages/OccupiedSlotsPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/entry" element={<EntryPage />} />
        <Route path="/exit" element={<ExitPage />} />
        <Route path="/free-slots" element={<FreeSlotsPage />} />
        <Route path="/occupied" element={<OccupiedSlotsPage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
