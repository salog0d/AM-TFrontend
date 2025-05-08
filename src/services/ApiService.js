import axios from 'axios';

const API_URL =  'http://localhost:8000/';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  response => {
    return response;
  }, 
  error => {
    // If 401 Unauthorized, clear localStorage and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (username, password) => {
    try {
      // First, get the token
      const response = await apiClient.post('/custom_auth/login/', { username, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Store user details from response
        const userData = {
          id: response.data.user_id,
          username: response.data.username,
          role: response.data.role
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Token not received from server');
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Call the logout endpoint if token exists
      if (localStorage.getItem('token')) {
        await apiClient.post('/custom_auth/logout/');
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  getUserRole: () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  }
};



export default apiClient;