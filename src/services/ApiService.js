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
      console.log('Intentando login con:', { username });
      
      // Try the JWT endpoint first
      let response;
      try {
        // Intenta primero la ruta JWT nueva
        response = await apiClient.post('/api/auth/token/', { username, password });
      } catch (e) {
        if (e.response && e.response.status === 404) {
          // Si recibimos 404, probamos con la ruta antigua
          console.log('Endpoint nuevo no encontrado, probando con endpoint antiguo');
          response = await apiClient.post('/custom_auth/token/', { username, password });
        } else {
          // Si es otro error, lo propagamos
          throw e;
        }
      }
      
      console.log('Respuesta completa:', response);
      console.log('Datos recibidos:', response.data);
      
      // Extrae los tokens (busca diferentes posibles estructuras)
      const accessToken = response.data.access || response.data.token;
      const refreshToken = response.data.refresh;
      
      if (accessToken) {
        // Almacena tokens
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Actualiza el header para la siguiente solicitud
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Extrae información del usuario - primero de la respuesta principal
        let userData = {
          id: response.data.id || response.data.user_id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
          discipline: response.data.discipline,
          is_active: response.data.is_active || response.data.active
        };
        
        // Si el usuario no está completo en la respuesta principal, intenta obtener el perfil
        if (!userData.role) {
          try {
            console.log('Intentando obtener más datos del usuario...');
            const userResponse = await apiClient.get('/custom_auth/profile/');
            console.log('Datos adicionales del usuario:', userResponse.data);
            
            userData = {
              id: userResponse.data.id || userData.id,
              username: userResponse.data.username || userData.username,
              email: userResponse.data.email || userData.email,
              role: userResponse.data.role || userData.role,
              discipline: userResponse.data.discipline || userData.discipline,
              is_active: userResponse.data.is_active || userResponse.data.active || userData.is_active
            };
          } catch (profileError) {
            console.warn('No se pudo obtener perfil completo:', profileError);
            // Si falla, usamos lo que tenemos
          }
        }
        
        console.log('Datos de usuario finales:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        console.error('No se recibieron tokens en la respuesta:', response.data);
        throw new Error('Tokens not received from server');
      }
    } catch (error) {
      console.error("Error completo de login:", error);
      if (error.response) {
        console.error("Datos del error:", error.response.data);
        console.error("Estado del error:", error.response.status);
      }
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Call the logout endpoint with refresh token if it exists
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Intenta primero la ruta JWT nueva
          await apiClient.post('/custom_auth/logout/', { refresh: refreshToken });
        } catch (e) {
          // Si falla, intentamos con la ruta antigua
          if (e.response && e.response.status === 404) {
            await apiClient.post('/custom_auth/logout/');
          }
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
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