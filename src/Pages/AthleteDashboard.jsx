import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { authService } from '../services/ApiService';

const AthleteDashboard = () => {
  const [athleteData, setAthleteData] = useState(null);
  const [coach, setCoach] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'profile', 'results'
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and load athlete data
    const init = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (user.role !== 'athlete') {
          // Redirect non-athletes
          if (user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (user.role === 'coach') {
            navigate('/coach-dashboard');
          } else {
            navigate('/login');
          }
          return;
        }
        
        setAthleteData(user);
        await fetchAthleteDetails(user.id);
        await fetchTestResults(user.id);
      } catch (err) {
        console.error('Error initializing athlete dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [navigate]);

  // Fetch additional athlete details including coach information
  const fetchAthleteDetails = async (athleteId) => {
    try {
      const response = await apiClient.get(`/dashboard/athlete-dashboard/${athleteId}/`);
      if (response.data && response.data.athlete) {
        console.log('Athlete data received:', response.data.athlete);
        
        // Update athlete data with additional details
        setAthleteData(prev => ({...prev, ...response.data.athlete}));
        
        // Coach information is now included in the response
        if (response.data.athlete.coach_details) {
          console.log('Coach details found:', response.data.athlete.coach_details);
          setCoach(response.data.athlete.coach_details);
        } else if (response.data.athlete.coach) {
          // Fallback: if coach_details is not available but coach ID is
          console.log('Coach ID found, but no details. Coach ID:', response.data.athlete.coach);
          // We could optionally fetch the coach details separately if needed
          // but ideally coach_details should be included in the serializer
        } else {
          console.log('No coach assigned to this athlete');
          setCoach(null);
        }
      }
    } catch (err) {
      console.error('Error fetching athlete details:', err);
      setError('Failed to load athlete details. Please try again.');
    }
  };

  // Fetch test results for the athlete
  const fetchTestResults = async (athleteId) => {
    setResultsLoading(true);
    try {
      const response = await apiClient.get(`/dashboard/test-results/${athleteId}/`);
      if (response.data && response.data.test_results) {
        setTestResults(response.data.test_results);
      } else {
        setTestResults([]);
      }
    } catch (err) {
      console.error('Error fetching test results:', err);
      setError('Failed to load test results. Please try again.');
    } finally {
      setResultsLoading(false);
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
                <div className="h-8 w-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold mr-2">AT</div>
                <span className="text-xl font-semibold text-gray-800">Athlete Dashboard</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, <span className="font-semibold">{athleteData?.username || 'Athlete'}</span>
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
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Results
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Athlete</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-700">{athleteData?.username}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Discipline</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-700">
                    {formatDiscipline(athleteData?.discipline)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Status</h3>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      athleteData?.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {athleteData?.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Coach</h3>
              {coach ? (
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {coach.profile_picture ? (
                      <img 
                        src={coach.profile_picture} 
                        alt={coach.username} 
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium text-gray-900">{coach.username}</h4>
                    <p className="text-sm text-gray-500">{formatDiscipline(coach.discipline)}</p>
                    <p className="text-sm text-gray-500">{coach.email}</p>
                    {coach.phone_number && (
                      <p className="text-sm text-gray-500">Tel: {coach.phone_number}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-gray-500 italic mt-2">No coach assigned.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Latest Results</h3>
              {resultsLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : testResults.length > 0 ? (
                <div className="space-y-3">
                  {testResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-800">{result.test_name || result.test?.name || 'Unknown Test'}</p>
                        <span className="text-sm font-medium text-gray-700">
                          {result.numeric_value} {result.test_unit || result.test?.unit || ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(result.date_recorded)}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('results')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    View all results
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 italic">No test results available.</p>
              )}
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
                    <p className="text-base font-medium text-gray-900">{athleteData?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{athleteData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{athleteData?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{athleteData?.role || 'Athlete'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(athleteData?.date_of_birth)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Athletic Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Discipline</p>
                    <p className="text-base font-medium text-gray-900">{formatDiscipline(athleteData?.discipline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base font-medium text-gray-900">{athleteData?.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coach</p>
                    <p className="text-base font-medium text-gray-900">{coach?.username || athleteData?.coach_username || 'No coach assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      athleteData?.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {athleteData?.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">My Test Results</h3>
              <p className="mt-1 text-sm text-gray-500">
                View all your performance test results.
              </p>
            </div>
            
            {resultsLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : testResults.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No test results</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any test results recorded yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
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
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.test_name || result.test?.name || 'Unknown Test'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (result.test_category || result.test?.category) === 'strength' ? 'bg-red-100 text-red-800' :
                            (result.test_category || result.test?.category) === 'endurance' ? 'bg-blue-100 text-blue-800' :
                            (result.test_category || result.test?.category) === 'speed' ? 'bg-yellow-100 text-yellow-800' :
                            (result.test_category || result.test?.category) === 'flexibility' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {(result.test_category || result.test?.category)?.charAt(0).toUpperCase() + (result.test_category || result.test?.category)?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.numeric_value} {result.test_unit || result.test?.unit || ''}
                            {(result.test_higher_is_better !== undefined || result.test?.higher_is_better !== undefined) && (
                              <span className="ml-2 text-xs">
                                {(result.test_higher_is_better || result.test?.higher_is_better) ? 
                                  <span className="text-green-600">↑</span> : 
                                  <span className="text-red-600">↓</span>
                                }
                              </span>
                            )}
                          </div>
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
        )}
      </div>
    </div>
  );
};

export default AthleteDashboard;