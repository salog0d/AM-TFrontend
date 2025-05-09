import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/ApiService'; 
import '../assets/styles/Login.css';

const AdminDashboard = () => {
    // Add state for user data if needed
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Load user data when component mounts
        const loadUserData = () => {
            try {
                const user = authService.getCurrentUser();
                setUserData(user);
                
                // Redirect if not admin
                if (user && user.role !== 'admin') {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadUserData();
    }, [navigate]);
    
    // Correct logout function
    const handleLogout = async () => {
        try {
            // Call the correct method - logout, not logon
            await authService.logout();
            console.log('Logout successful');
            
            // Navigate to login page
          
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Handler for navigating to user management page
    const goToUserManagement = () => {
        navigate('/users-panel');
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700">
                      <span className="font-medium">{userData?.username || 'Admin'}</span>
                  </div>
                  <button 
                      onClick={handleLogout} 
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition shadow-md flex items-center"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                  </button>
              </div>
          </div>

          {/* Welcome Message */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to the Admin Dashboard</h2>
              <p className="text-gray-700">
                  From here, you can manage your entire Athlete Tracking System. Use the cards below to access different administrative functions.
              </p>
          </div>

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* System Stats */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">System Stats</h2>
                      <div className="p-2 bg-blue-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                      </div>
                  </div>
                  <p className="text-gray-600 mb-4">Quick overview of system statistics and performance metrics.</p>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-white-800 py-2 rounded-lg transition flex items-center justify-center">
                      <span>View Statistics</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                  </button>
              </div>

              {/* User Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                      <div className="p-2 bg-green-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                      </div>
                  </div>
                  <p className="text-gray-600 mb-4">Manage system users, including create, edit, and delete operations.</p>
                  <button 
                      onClick={goToUserManagement}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center"
                  >
                      <span>Manage Users</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                  </button>
              </div>

              {/* Test Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Test Management</h2>
                      <div className="p-2 bg-purple-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                      </div>
                  </div>
                  <p className="text-gray-600 mb-4">Configure and manage athletic tests and evaluation sessions.</p>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-white py-2 rounded-lg transition flex items-center justify-center">
                      <span>Manage Tests</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                  </button>
              </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                      { label: 'Add User', color: 'blue', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
                      { label: 'New Test', color: 'green', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                      { label: 'Schedule', color: 'yellow', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                      { label: 'Reports', color: 'purple', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
                  ].map(({ label, color, icon }, i) => (
                      <button key={i} className={`p-4 bg-${color}-50 hover:bg-${color}-100 rounded-lg flex flex-col items-center justify-center transition text-${color}-700`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                          </svg>
                          <span>{label}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
  </div>
);
};


export default AdminDashboard;