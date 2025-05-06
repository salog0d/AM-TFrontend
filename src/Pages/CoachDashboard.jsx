import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, Award, Calendar, ChevronDown, ChevronUp, LogOut } from 'lucide-react';

// This would be replaced with actual API calls using axios
const fetchDashboardData = () => {
  // In a real application, this would be an axios call to your Django backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        athletes: [
          { id: 1, name: 'Miguel Rodríguez', discipline: 'Soccer', progress: 85 },
          { id: 2, name: 'Ana García', discipline: 'Volleyball', progress: 72 },
          { id: 3, name: 'Carlos Martínez', discipline: 'Basketball', progress: 90 },
          { id: 4, name: 'Laura Fernández', discipline: 'Athletics', progress: 78 },
          { id: 5, name: 'Javier López', discipline: 'Swimming', progress: 82 },
        ],
        recentTests: [
          { id: 1, name: '30m Sprint', athlete: 'Miguel Rodríguez', value: 4.5, unit: 'seconds', date: '2025-04-28' },
          { id: 2, name: 'Vertical Jump', athlete: 'Ana García', value: 42, unit: 'centimeters', date: '2025-05-01' },
          { id: 3, name: 'Beep Test', athlete: 'Carlos Martínez', value: 12, unit: 'level', date: '2025-05-02' },
          { id: 4, name: 'Push-ups', athlete: 'Laura Fernández', value: 25, unit: 'repetitions', date: '2025-05-03' },
        ],
        performanceData: [
          { month: 'Jan', strength: 65, endurance: 70, speed: 60 },
          { month: 'Feb', strength: 68, endurance: 72, speed: 65 },
          { month: 'Mar', strength: 72, endurance: 75, speed: 68 },
          { month: 'Apr', strength: 75, endurance: 78, speed: 73 },
          { month: 'May', strength: 80, endurance: 82, speed: 78 },
        ],
        upcomingSessions: [
          { id: 1, title: 'Strength Assessment', date: '2025-05-08', location: 'Main Gym' },
          { id: 2, title: 'Endurance Tests', date: '2025-05-12', location: 'Track Field' },
          { id: 3, title: 'Speed & Agility', date: '2025-05-15', location: 'Indoor Court' },
        ]
      });
    }, 1000);
  });
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleLogout = () => {
    // In a real application, this would call your logout API endpoint
    alert('Logout clicked - This would log you out in a real app');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl">Athlete Tracking System</div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Coach Dashboard</h1>
          <p className="text-gray-600">Monitor your athletes' performance and upcoming evaluations.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('athletes')} 
              className={`px-6 py-3 font-medium ${activeTab === 'athletes' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
            >
              Athletes
            </button>
            <button 
              onClick={() => setActiveTab('tests')} 
              className={`px-6 py-3 font-medium ${activeTab === 'tests' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
            >
              Tests
            </button>
            <button 
              onClick={() => setActiveTab('sessions')} 
              className={`px-6 py-3 font-medium ${activeTab === 'sessions' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
            >
              Sessions
            </button>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick stats */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Athletes</div>
                  <div className="text-2xl font-bold">{dashboardData.athletes.length}</div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg flex items-center">
                <div className="bg-green-500 p-3 rounded-full text-white mr-4">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Recent Tests</div>
                  <div className="text-2xl font-bold">{dashboardData.recentTests.length}</div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg flex items-center">
                <div className="bg-purple-500 p-3 rounded-full text-white mr-4">
                  <Award size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Top Performance</div>
                  <div className="text-2xl font-bold">90%</div>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg flex items-center">
                <div className="bg-amber-500 p-3 rounded-full text-white mr-4">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Upcoming Sessions</div>
                  <div className="text-2xl font-bold">{dashboardData.upcomingSessions.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance chart */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Performance Trends</h2>
              <button className="text-blue-600 text-sm">View Details</button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="strength" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="endurance" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="speed" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Athletes list */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('athletes')}
            >
              <h2 className="text-lg font-semibold">Top Athletes</h2>
              {expandedSection === 'athletes' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <div className={`mt-4 space-y-4 ${expandedSection === 'athletes' ? 'block' : 'hidden md:block'}`}>
              {dashboardData.athletes.slice(0, 4).map((athlete) => (
                <div key={athlete.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="font-medium">{athlete.name}</div>
                    <div className="text-sm text-gray-500">{athlete.discipline}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 text-sm">{athlete.progress}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${athlete.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="text-blue-600 text-sm">View All Athletes</button>
            </div>
          </div>

          {/* Recent tests */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('tests')}
            >
              <h2 className="text-lg font-semibold">Recent Tests</h2>
              {expandedSection === 'tests' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <div className={`mt-4 ${expandedSection === 'tests' ? 'block' : 'hidden md:block'}`}>
              <div className="space-y-4">
                {dashboardData.recentTests.map((test) => (
                  <div key={test.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm font-semibold">{test.value} {test.unit}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {test.athlete} • {new Date(test.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 text-sm mt-4">View All Tests</button>
            </div>
          </div>

          {/* Upcoming sessions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('sessions')}
            >
              <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
              {expandedSection === 'sessions' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <div className={`mt-4 ${expandedSection === 'sessions' ? 'block' : 'hidden md:block'}`}>
              <div className="space-y-4">
                {dashboardData.upcomingSessions.map((session) => (
                  <div key={session.id} className="border-b pb-3">
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()} • {session.location}
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 text-sm mt-4">View All Sessions</button>
            </div>
          </div>

          {/* Athlete progress */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4">Athlete Progress</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.athletes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#3B82F6" name="Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© 2025 Athlete Tracking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;