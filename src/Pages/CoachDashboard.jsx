import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { authService } from '../services/ApiService';

const CoachDashboard = () => {
  const [coachData, setCoachData] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'profile', 'athletes'
  const [showAthleteDetails, setShowAthleteDetails] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and load coach data
    const init = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (user.role !== 'coach') {
          // Redirect non-coaches
          if (user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (user.role === 'athlete') {
            navigate('/athlete-dashboard');
          } else {
            navigate('/login');
          }
          return;
        }
        
        setCoachData(user);
        await fetchAthletes(user.id);
      } catch (err) {
        console.error('Error initializing coach dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [navigate]);

  // Fetch athletes assigned to this coach
  const fetchAthletes = async (coachId) => {
    try {
      console.log('Fetching athletes for coach ID:', coachId);
      const response = await apiClient.get(`/dashboard/coach-dashboard/${coachId}/`);
      console.log('Coach dashboard response:', response.data);
      
      if (response.data && response.data.athletes) {
        console.log('Athletes found:', response.data.athletes);
        setAthletes(response.data.athletes);
      } else {
        console.log('No athletes found in response');
        setAthletes([]);
      }
    } catch (err) {
      console.error('Error fetching athletes:', err);
      setError('Failed to load athletes. Please try again.');
    }
  };

  // Fetch test results for a specific athlete
  const fetchAthleteResults = async (athleteId) => {
    setLoadingResults(true);
    try {
      const response = await apiClient.get(`/dashboard/test-results/${athleteId}/`);
      if (response.data && response.data.test_results) {
        setTestResults(response.data.test_results);
      } else {
        setTestResults([]);
      }
    } catch (err) {
      console.error('Error fetching test results:', err);
    } finally {
      setLoadingResults(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // View athlete details
  const viewAthleteDetails = async (athlete) => {
    setSelectedAthlete(athlete);
    setShowAthleteDetails(true);
    await fetchAthleteResults(athlete.id);
  };

  // Close athlete details modal
  const closeAthleteDetails = () => {
    setShowAthleteDetails(false);
    setSelectedAthlete(null);
    setTestResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper function to get formatted date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render discipline name more user-friendly
  const formatDiscipline = (discipline) => {
    if (!discipline) return 'Unknown';
    return discipline
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-2">AT</div>
                <span className="text-xl font-semibold text-gray-800">Coach Dashboard</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, <span className="font-semibold">{coachData?.username || 'Coach'}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('athletes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'athletes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Athletes ({athletes.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Total Athletes</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-700">{athletes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Active Athletes</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-700">
                    {athletes.filter(athlete => athlete.active !== false).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Discipline</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-700">
                    {formatDiscipline(coachData?.discipline)}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 bg-white rounded-lg shadow-md p-6 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Athletes Summary</h3>
              <div className="border-t border-gray-200 py-4">
                {athletes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {athletes.slice(0, 6).map((athlete) => (
                      <div key={athlete.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {athlete.username?.charAt(0).toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{athlete.username}</p>
                            <p className="text-xs text-gray-500">{formatDiscipline(athlete.discipline)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center">No athletes assigned yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-base font-medium text-gray-900">{coachData?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{coachData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{coachData?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{coachData?.role || 'Coach'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(coachData?.date_of_birth)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Professional Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Discipline</p>
                    <p className="text-base font-medium text-gray-900">{formatDiscipline(coachData?.discipline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base font-medium text-gray-900">{coachData?.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned Athletes</p>
                    <p className="text-base font-medium text-gray-900">{athletes.length} athletes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      coachData?.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {coachData?.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === 'athletes' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">My Athletes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Total athletes under your coaching: {athletes.length}
              </p>
            </div>
            
            {athletes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No athletes assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Contact your administrator to have athletes assigned to you.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Athlete
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discipline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {athletes.map((athlete) => (
                      <tr key={athlete.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {athlete.profile_picture ? (
                                <img 
                                  src={athlete.profile_picture} 
                                  alt={athlete.username} 
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-gray-500 font-medium">
                                  {athlete.username?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {athlete.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {athlete.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDiscipline(athlete.discipline)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            athlete.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {athlete.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(athlete.date_of_birth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => viewAthleteDetails(athlete)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Athlete Details Modal */}
      {showAthleteDetails && selectedAthlete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Athlete Details: {selectedAthlete.username}
              </h3>
              <button 
                onClick={closeAthleteDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Personal Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedAthlete.name || selectedAthlete.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedAthlete.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedAthlete.date_of_birth)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedAthlete.phone_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Athletic Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Discipline</p>
                      <p className="text-sm font-medium text-gray-900">{formatDiscipline(selectedAthlete.discipline)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedAthlete.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAthlete.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Coach</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAthlete.coach_username || coachData?.username || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Test Results
              </h4>
              {loadingResults ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : testResults.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No test results available for this athlete.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testResults.map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.test_name || result.test?.name || 'Unknown Test'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.numeric_value} {result.test_unit || result.test?.unit || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(result.date_recorded)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {result.notes || 'No notes'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button 
                onClick={closeAthleteDetails}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;