import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.jsx';
import AthleteDashboard from './Pages/AthleteDashboard.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import CoachDashboard from './Pages/CoachDashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
