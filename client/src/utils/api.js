import config from '../config/config';

export const API = {
  get: (endpoint) => fetch(`${config.backendUrl}${endpoint}`),
  post: (endpoint, data) => fetch(`${config.backendUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }),
  // Add other methods as needed
};

// Example usage in any component
import { API } from '../utils/api';
import config from '../config/config';

// Using the API utility
const fetchData = async () => {
  try {
    const response = await API.get('/api/items');
    const data = await response.json();
    // Handle data
  } catch (error) {
    console.error('Error:', error);
  }
};

// Direct URL access if needed
console.log('Backend URL:', config.backendUrl);