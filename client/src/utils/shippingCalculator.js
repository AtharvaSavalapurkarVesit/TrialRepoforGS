/**
 * Utility functions for calculating shipping charges based on distance
 */

/**
 * Calculate shipping charge based on distance
 * 
 * Distance ranges and charges:
 * 0–50 km (Local): ₹30 – ₹60 (Intra-city or nearby towns)
 * 50–200 km (Short Zone): ₹50 – ₹100 (Same state, nearby districts)
 * 200–500 km (Zonal): ₹80 – ₹150 (Inter-district/state)
 * 500+ km (Long Distance): ₹150 – ₹250 (Inter-state)
 * 
 * @param {number} distance - Distance in kilometers
 * @param {number} itemValue - Value of the item in rupees (for value-based adjustments)
 * @returns {Object} - Shipping details including base charge, GST, total, and shipping zone
 */
export const calculateShippingCharge = (distance, itemValue = 0) => {
  // Default values in case of invalid input
  if (!distance || isNaN(distance) || distance < 0) {
    return {
      baseCharge: 0,
      gst: 0,
      total: 0,
      zone: 'Unknown',
      note: 'Could not calculate shipping - invalid distance'
    };
  }

  let baseCharge = 0;
  let zone = '';
  let note = '';

  // Calculate base charge based on distance ranges
  if (distance <= 5) {
    // Very local (same area/neighborhood): ₹30 fixed
    baseCharge = 30;
    zone = 'Local';
    note = 'Typically arrives in 1 day';
  } else if (distance <= 50) {
    // Local: ₹30 – ₹60
    // For local, scale the charge based on the actual distance within the range
    baseCharge = Math.round(30 + ((distance - 5) / 45) * 30);
    zone = 'Local';
    note = 'Typically arrives in 1-2 days';
  } else if (distance <= 200) {
    // Short Zone: ₹50 – ₹100
    // Scale based on where in the range the distance falls
    baseCharge = Math.round(50 + ((distance - 50) / 150) * 50);
    zone = 'Short Zone';
    note = 'Typically arrives in 2-3 days';
  } else if (distance <= 500) {
    // Zonal: ₹80 – ₹150
    // Scale based on where in the range the distance falls
    baseCharge = Math.round(80 + ((distance - 200) / 300) * 70);
    zone = 'Zonal';
    note = 'Typically arrives in 3-5 days';
  } else {
    // Long Distance: ₹150 – ₹250 for anything over 500km
    // Scale based on distance, but cap at 250
    baseCharge = Math.min(250, Math.round(150 + ((distance - 500) / 500) * 100));
    zone = 'Long Distance';
    note = 'Typically arrives in 5-7 days';
  }

  // Add value-based adjustments for higher value items (optional)
  if (itemValue > 10000) {
    // For high value items, add a small premium
    baseCharge += Math.min(50, Math.round(itemValue * 0.005)); // 0.5% of value, max ₹50
  }

  // Calculate GST (18% on base charge)
  const gst = Math.round(baseCharge * 0.18);
  
  // Calculate total shipping charge
  const total = baseCharge + gst;

  return {
    baseCharge,
    gst,
    total,
    zone,
    note,
    distanceKm: distance
  };
}; 