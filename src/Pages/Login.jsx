import { useState } from 'react';
import '../assets/styles/Login.css';
import { authService } from '../services/ApiService'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!username) {
      setError('Por favor, introduce tu nombre de usuario.');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Por favor, introduce tu contraseña.');
      setLoading(false);
      return;
    }
    
    try {
      // Call the login method from the authService
      const response = await authService.login(username, password);
      console.log('Login response:', response);
      
      // Check the user's role and redirect accordingly
      if (response.role === 'admin') {
        window.location = "admin-dashboard";
      } else if (response.role === 'coach') {
        window.location = "coach-dashboard";
      } else if (response.role === 'athlete') {
        window.location = "athlete-dashboard";
      } else {
        // Default fallback
        window.location = "/login";
      }
    } catch (error) {
      console.error('Login error:', error);
      // Mejora del mensaje de error para ser más descriptivo
      if (error.response && error.response.status === 401) {
        setError('Credenciales inválidas. Por favor, verifica tu usuario y contraseña.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 transition-all duration-300 hover:translate-y-1 hover:shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 000-12v12z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-600">Athlete Tracking System</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center text-sm border-l-4 border-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-black block mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-md text-sm text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-black"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium text-black block mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-md text-sm text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-black"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <div className="text-right">
            <a href="#" className="text-sm text-blue-500 hover:text-blue-600 hover:underline transition">
              Forgot password?
            </a>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-md shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 relative flex items-center justify-center h-12 "
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Athlete Tracking System. All rights reserved. @SHIELD</p>
        </div>
      </div>
    </div>
  );
};

export default Login;