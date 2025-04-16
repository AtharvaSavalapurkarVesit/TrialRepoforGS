/**
 * Global button styles to prevent shaking and visual inconsistencies
 */

const buttonStyles = {
  // Prevent button content shift and shaking
  button: {
    // Disable transform animations that can cause shaking
    transform: 'none !important',
    // Only animate these properties
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s',
    // Maintain consistent dimensions with flexbox
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Prevent text wrapping which can cause height changes
    whiteSpace: 'nowrap',
    // Ensure proper height
    minHeight: '36px',
    // Fix padding to prevent content shifts
    padding: '8px 16px',
    // Stop the button from changing size based on content
    boxSizing: 'border-box',
  },
  
  // Additional styles for contained (solid) buttons
  containedButton: {
    boxShadow: 'none !important', // Disable box-shadow animations
  },
  
  // Additional styles for loading buttons
  loadingButton: {
    // Set minimum width for stability
    minWidth: '100px',
    // Control pointer events during loading
    pointerEvents: 'none',
  }
};

export default buttonStyles; 