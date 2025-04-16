import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { setToken, removeToken, initializeAuth } from '../utils/authHelpers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      // Initialize auth and set token in API headers
      const isAuthenticated = initializeAuth();
      
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        // Use the appropriate endpoint for fetching user data
        const response = await api.get('/api/auth');
        setUser(response.data);
      } catch (err) {
        console.error('Error loading user:', err);
        removeToken();
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/api/auth/register', formData);
      
      // Save token and set in API headers
      setToken(res.data.token);
      setUser(res.data.user);
      
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.msg || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // Save token and set in API headers
      setToken(token);
      setUser(userData);
      setError(null);
      
      return { success: true };
    } catch (err) {
      setUser(null);
      removeToken();
      
      setError(
        err.response?.data?.message || 
        'Failed to login. Please check your credentials.'
      );
      
      return { 
        success: false, 
        error: err.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    removeToken();
    setUser(null);
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 