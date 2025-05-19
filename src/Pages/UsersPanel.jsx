import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { authService } from '../services/ApiService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'athlete', // Default role
        discipline: 'athletics', // Default discipline
        date_of_birth: '',
        phone_number: '',
        active: true,
        coach: null
    });
    const [coaches, setCoaches] = useState([]);
    const navigate = useNavigate();

    // Get all users on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const user = authService.getCurrentUser();
            if (!user || user.role !== 'admin') {
                navigate('/');
                return;
            }
            
            fetchUsers();
        };
        
        checkAuth();
    }, [navigate]);

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/custom_auth/list/');
            setUsers(response.data.Users || []);
            
            // Extract coaches for dropdown
            const coachList = response.data.Users.filter(user => user.role === 'coach');
            setCoaches(coachList);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle input change in form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Open modal for creating user
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'athlete',
            discipline: 'athletics',
            date_of_birth: '',
            phone_number: '',
            active: true,
            coach: null
        });
        setShowModal(true);
    };

    // Open modal for editing user
    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            password: '', // Password field is empty when editing
            role: user.role || 'athlete',
            discipline: user.discipline || 'athletics',
            date_of_birth: user.date_of_birth || '',
            phone_number: user.phone_number || '',
            active: user.active !== undefined ? user.active : true,
            coach: user.coach || null
        });
        setShowModal(true);
    };

    // Open modal for deleting user
    const openDeleteModal = (user) => {
        setModalMode('delete');
        setSelectedUser(user);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (modalMode === 'create') {
                // Create new user
                await apiClient.post('/custom_auth/register/', formData);
            } else if (modalMode === 'edit') {
                // Update existing user
                // If password is empty, remove it from formData
                const dataToSend = {...formData};
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await apiClient.put(`/custom_auth/update/${selectedUser.id}/`, dataToSend);
            } else if (modalMode === 'delete') {
                // Delete user
                await apiClient.delete(`/custom_auth/delete/${selectedUser.id}/`);
            }
            
            // Refresh user list
            await fetchUsers();
            closeModal();
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Go back to admin dashboard
    const goBack = () => {
        navigate('/admin-dashboard');
    };

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Render the user management interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={goBack}
                            className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition shadow-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New User
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* User Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">ID</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Username</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Email</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Role</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Discipline</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Status</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3 px-4 text-sm text-gray-500">{user.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">{user.username}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                            user.role === 'coach' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">{user.discipline}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-green-800'
                                        }`}>
                                            {user.active ? 'Inactive' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(user)}
                                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Create/Edit/Delete */}
            {showModal && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {modalMode === 'create' ? 'Create New User' : 
                                 modalMode === 'edit' ? 'Edit User' : 'Delete User'}
                            </h3>
                            <button 
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-200 rounded transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {modalMode === 'delete' ? (
                            <div className="p-6">
                                <p className="mb-4 text-gray-700">Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.username}</span>?</p>
                                <p className="mb-6 text-red-600 text-sm">This action cannot be undone.</p>
                                
                                <div className="flex justify-end space-x-3">
                                    <button 
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-white rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>Delete User</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                            <input 
                                                type="text" 
                                                name="username" 
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password {modalMode === 'edit' && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
                                        </label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            required={modalMode === 'create'}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select 
                                                name="role" 
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            >
                                                <option value="athlete">Athlete</option>
                                                <option value="coach">Coach</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                                            <select 
                                                name="discipline" 
                                                value={formData.discipline}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            >
                                                <option value="athletics">Athletics</option>
                                                <option value="soccer">Soccer</option>
                                                <option value="volleyball">Volleyball</option>
                                                <option value="basketball">Basketball</option>
                                                <option value="tennis">Tennis</option>
                                                <option value="rugby">Rugby</option>
                                                <option value="american_football">American Football</option>
                                                <option value="swimming">Swimming</option>
                                                <option value="taekwondo">Taekwondo</option>
                                                <option value="flag_football">Flag Football</option>
                                                <option value="futsal">Futsal</option>
                                                <option value="beach_volleyball">Beach Volleyball</option>
                                                <option value="table_tennis">Table Tennis</option>
                                                <option value="martial_arts">Martial Arts</option>
                                                <option value="boxing">Boxing</option>
                                                <option value="physical_conditioning">Physical Conditioning</option>
                                                <option value="gap_training">GAP Training</option>
                                                <option value="investigation">Investigation</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {formData.role === 'athlete' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                                            <select 
                                                name="coach" 
                                                value={formData.coach || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            >
                                                <option value="">Select a coach</option>
                                                {coaches.map(coach => (
                                                    <option key={coach.id} value={coach.id}>
                                                        {coach.username} - {coach.discipline}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <input 
                                                type="date" 
                                                name="date_of_birth" 
                                                value={formData.date_of_birth}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                name="phone_number" 
                                                value={formData.phone_number}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id="active" 
                                            name="active" 
                                            checked={formData.active}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                            Active
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                                    <button 
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-white rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className={`px-4 py-2 rounded-lg text-white transition flex items-center ${
                                            modalMode === 'create' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>{modalMode === 'create' ? 'Create User' : 'Update User'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;