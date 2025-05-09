import axios from 'axios';

const API_URL = 'http://localhost:8000/';

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
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and refreshing
apiClient.interceptors.response.use(
  response => {
    return response;
  }, 
  async error => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, logout
          authService.logout();
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}custom_auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        if (response.data.access) {
          // Store the new access token
          localStorage.setItem('accessToken', response.data.access);
          
          // Update the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refreshing fails, logout
        authService.logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}custom_auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la autenticación');
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Guardar tokens
      if (data.access) {
        localStorage.setItem('accessToken', data.access);
      }
      
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }
  
      // Extraer información directamente de la respuesta
      let userData = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,  // This should now be available directly
        discipline: data.discipline,
        active: data.is_active
      };
      
      // Guardar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
  
      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },


  logout: async () => {
    
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken"); 
      
      try {
        await fetch(`${API_URL}/custom_auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, 
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (apiError) {
        console.error('Error al comunicar logout al servidor:', apiError);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    
      return { success: true };
    
  },
  
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${API_URL}custom_auth/token/refresh/`, {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        return response.data.access;
      } else {
        throw new Error('Access token not received');
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      authService.logout();
      throw error;
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
    return !!localStorage.getItem('accessToken');
  },
  
  getUserRole: () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  },
  
  // Método para obtener perfil del usuario
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('custom_auth/profile/');
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
  

};

export default apiClient;