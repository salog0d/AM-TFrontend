import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.jsx';
import AthleteDashboard from './Pages/AthleteDashboard.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import CoachDashboard from './Pages/CoachDashboard.jsx';
import UsersPanel from './Pages/UsersPanel.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/users-panel" element={<UsersPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
