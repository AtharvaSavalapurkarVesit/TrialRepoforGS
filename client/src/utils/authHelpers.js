import api from './api';

// Tokens
export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['x-auth-token'] = token;
  }
};

export const removeToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['x-auth-token'];
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get the payload part of the JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    // Check if expiration time is past current time
    return exp * 1000 < Date.now();
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
};

// Initialize auth in the application
export const initializeAuth = () => {
  const token = getToken();
  
  if (token && !isTokenExpired(token)) {
    api.defaults.headers.common['x-auth-token'] = token;
    return true;
  } else if (token) {
    // If token exists but is expired, remove it
    removeToken();
  }
  
  return false;
}; 