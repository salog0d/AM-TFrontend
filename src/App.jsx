import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.jsx';
import AthleteDashboard from './Pages/AthleteDashboard.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import CoachDashboard from './Pages/CoachDashboard.jsx';
import UsersPanel from './Pages/UsersPanel.jsx';
import TestsPanel from './Pages/TestsPanel.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/users-panel" element={<UsersPanel />} />
        <Route path="/tests-panel" element={<TestsPanel />} />
        {/* Ruta por defecto redirige al login */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;