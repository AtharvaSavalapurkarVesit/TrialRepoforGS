/**
 * Utility functions for pincode to coordinates conversion and distance calculation
 */
import api from './api';

// Haversine formula to calculate distance between two coordinates (client-side fallback)
export const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

// Cache for pincode to coordinates conversion to avoid repeated API calls
const pincodeCache = {};

/**
 * Convert Indian pincode to coordinates using an external API
 * Uses a cache to minimize API calls
 */
export const getPincodeCoordinates = async (pincode) => {
  if (!pincode) return null;
  
  // Return cached result if available
  if (pincodeCache[pincode]) {
    return pincodeCache[pincode];
  }
  
  try {
    // First try the India Post API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      // Using first post office's coordinates
      const postOffice = data[0].PostOffice[0];
      
      // Store in cache
      const coordinates = {
        latitude: parseFloat(postOffice.Latitude),
        longitude: parseFloat(postOffice.Longitude),
        district: postOffice.District,
        state: postOffice.State
      };
      
      pincodeCache[pincode] = coordinates;
      return coordinates;
    }
    
    // Fallback to geonames.org or other services
    // Note: This would need registration for an API key
    // This is a simplified example
    
    // For this demo, return approximate coordinates by pincode region
    // In a real app, you would use a proper geocoding service
    return getFallbackCoordinates(pincode);
    
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    return getFallbackCoordinates(pincode);
  }
};

// Fallback method using the first few digits of pincode for rough location
const getFallbackCoordinates = (pincode) => {
  // This is a simplified mapping of pincode ranges to approximate coordinates
  // In reality, you would use a complete database or API
  
  // First check if this is a Mumbai pincode that we can map more precisely
  const firstThreeDigits = pincode.substring(0, 3);
  
  // More detailed mapping for Mumbai and surrounding regions
  const mumbaiPincodes = {
    '400': { latitude: 19.0760, longitude: 72.8777, region: 'Mumbai' },
    '4000': { latitude: 18.9387, longitude: 72.8353, region: 'Mumbai South' },    // Fort area
    '4001': { latitude: 18.9690, longitude: 72.8200, region: 'Mumbai South' },    // Colaba area
    '4002': { latitude: 19.0200, longitude: 72.8270, region: 'Mumbai Central' },  // Central Mumbai
    '4003': { latitude: 19.0500, longitude: 72.8300, region: 'Mumbai West' },     // Worli/Prabhadevi
    '4005': { latitude: 19.0900, longitude: 72.8600, region: 'Mumbai West' },     // Bandra
    '4006': { latitude: 19.1200, longitude: 72.8400, region: 'Mumbai Northwest' },// Santacruz/Vile Parle
    '4007': { latitude: 19.0700, longitude: 72.9000, region: 'Mumbai Northeast' },// Kurla/Chembur/etc
    '4008': { latitude: 19.0400, longitude: 73.0200, region: 'Navi Mumbai' },     // Vashi/Airoli/etc
    '4009': { latitude: 19.2000, longitude: 72.8500, region: 'Mumbai Northwest' },// Borivali/Kandivali/etc
    '401': { latitude: 19.2183, longitude: 72.9781, region: 'Thane' },
    '402': { latitude: 18.9068, longitude: 72.8164, region: 'Navi Mumbai' },
  };
  
  // Try to match on first 3-4 digits for Mumbai
  if (pincode.startsWith('400') || pincode.startsWith('401') || pincode.startsWith('402')) {
    // Try with first 4 digits first for more accuracy
    const firstFourDigits = pincode.substring(0, 4);
    if (mumbaiPincodes[firstFourDigits]) {
      return mumbaiPincodes[firstFourDigits];
    }
    
    // Try with first 3 digits 
    if (mumbaiPincodes[firstThreeDigits]) {
      return mumbaiPincodes[firstThreeDigits];
    }
  }
  
  // For other regions, use the first two digits
  const firstTwoDigits = pincode.substring(0, 2);
  
  // Very approximate mapping (NOT for production use)
  const pincodeRanges = {
    '11': { latitude: 28.6139, longitude: 77.2090, region: 'Delhi' },       // Delhi
    '40': { latitude: 19.0760, longitude: 72.8777, region: 'Mumbai' },      // Mumbai
    '50': { latitude: 17.3850, longitude: 78.4867, region: 'Hyderabad' },   // Hyderabad
    '60': { latitude: 13.0827, longitude: 80.2707, region: 'Chennai' },     // Chennai
    '70': { latitude: 22.5726, longitude: 88.3639, region: 'Kolkata' },     // Kolkata
    '56': { latitude: 12.9716, longitude: 77.5946, region: 'Bengaluru' },   // Bengaluru
    // Add more approximate locations as needed
  };
  
  const result = pincodeRanges[firstTwoDigits] || 
    { latitude: 20.5937, longitude: 78.9629, region: 'Central India' }; // Default to center of India
  
  // Store in cache
  pincodeCache[pincode] = result;
  return result;
};

// Cache for distance calculations to avoid repeated API calls
const distanceCache = {};

/**
 * Calculate distance between two pincodes using the server endpoint
 * Returns distance in kilometers and location info
 * 
 * @param {string} pincode1 - First pincode (usually buyer's)
 * @param {string} pincode2 - Second pincode (usually seller's)
 * @param {string} sellerId - Optional: seller's ID to get their pincode from the database
 */
export const getDistanceBetweenPincodes = async (pincode1, pincode2, sellerId) => {
  // If neither pincode2 nor sellerId is provided, we can't calculate distance
  if (!pincode1 && !pincode2 && !sellerId) {
    console.warn('Missing required parameters:', { pincode1, pincode2, sellerId });
    return { 
      distance: null, 
      error: 'Insufficient information for distance calculation' 
    };
  }
  
  // If both pincode2 and sellerId are provided, pincode2 takes precedence
  
  // Validate pincode format if provided (6 digits for Indian pincodes)
  const pincodeRegex = /^\d{6}$/;
  if (pincode1 && !pincodeRegex.test(pincode1)) {
    console.warn('Invalid pincode1 format:', pincode1);
    return {
      distance: null,
      error: 'Invalid pincode format. Pincodes should be 6 digits.'
    };
  }
  
  if (pincode2 && !pincodeRegex.test(pincode2)) {
    console.warn('Invalid pincode2 format:', pincode2);
    return {
      distance: null,
      error: 'Invalid pincode format. Pincodes should be 6 digits.'
    };
  }
  
  // Create a cache key based on available parameters
  const cacheKey = sellerId 
    ? `user-${pincode1}-seller-${sellerId}` 
    : `${pincode1}-${pincode2}`;
  
  // Check cache first
  if (distanceCache[cacheKey]) {
    return distanceCache[cacheKey];
  }
  
  try {
    // Prepare payload
    const payload = {
      fromPincode: pincode1
    };
    
    // Add either toPincode or sellerId
    if (pincode2) {
      payload.toPincode = pincode2;
    } else if (sellerId) {
      payload.sellerId = sellerId;
    }
    
    // Call the server endpoint using the api utility that already handles auth tokens
    const response = await api.post('/api/items/distance', payload);
    
    const result = response.data;
    
    // Add to cache
    distanceCache[cacheKey] = result;
    
    return result;
  } catch (error) {
    console.error('Error calculating distance:', error);
    
    // Return error info
    return { 
      distance: null, 
      error: error.response?.data?.message || 'Could not calculate distance' 
    };
  }
}; 