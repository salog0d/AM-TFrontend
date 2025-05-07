import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/CoachDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/coach-dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
