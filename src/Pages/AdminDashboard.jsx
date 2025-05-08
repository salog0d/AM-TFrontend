import { useState, useEffect } from 'react';
import '../assets/styles/Login.css';
import { authService } from '../services/ApiService'; 

const AdminDashboard = () => {
    // Add state for user data if needed
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Load user data when component mounts
        const loadUserData = () => {
            try {
                const user = authService.getCurrentUser();
                setUserData(user);
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadUserData();
    }, []);
    
    // Correct logout function
    const handleLogout = async () => {
        try {
            // Call the correct method - logout, not logon
            await authService.logout();
            console.log('Logout successful');
            
            // Navigate to login page
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <button 
                onClick={handleLogout} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition shadow-md"
              >
                Logout
              </button>
            </div>
    
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                Welcome back, <span className="font-semibold">{userData?.username || 'Admin'}</span>!
              </p>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">System Stats</h2>
                <p className="text-gray-700">Quick overview of system statistics.</p>
              </div>
              <div className="bg-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">User Management</h2>
                <p className="text-gray-700">Manage system users and their permissions.</p>
              </div>
            </div>
          </div>
        </div>
      );
    };

export default AdminDashboard;