import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';

/**
 * A button component that shows loading state with a spinner
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {string} props.loadingText - Text to display while loading (defaults to "Processing...")
 * @param {React.ReactNode} props.startIcon - Icon to display at the start of the button
 * @param {React.ReactNode} props.loadingIcon - Optional custom loading icon (defaults to CircularProgress)
 * @param {string} props.children - Button text
 * @param {Function} props.onClick - Click handler function
 */
const LoadingButton = ({
  loading = false,
  loadingText = "Processing...",
  startIcon,
  loadingIcon,
  children,
  onClick,
  ...buttonProps
}) => {
  // Default loading icon is a CircularProgress
  const defaultLoadingIcon = <CircularProgress size={20} color="inherit" />;
  
  // Create a container div to lock the dimensions
  return (
    <Box sx={{ 
      display: 'inline-block', 
      position: 'relative',
      width: buttonProps.fullWidth ? '100%' : 'auto'
    }}>
      <Button
        {...buttonProps}
        onClick={loading ? undefined : onClick}
        disabled={loading || buttonProps.disabled}
        startIcon={loading ? (loadingIcon || defaultLoadingIcon) : startIcon}
        sx={{
          transition: 'background-color 0.2s, color 0.2s', // Only animate color changes
          transform: 'none !important', // Prevent any transform animations
          minHeight: '36px',
          ...buttonProps.sx,
          cursor: loading ? 'not-allowed' : (buttonProps.disabled ? 'not-allowed' : 'pointer'),
          // Ensure consistent width by using flexbox
          display: 'flex',
          justifyContent: 'center',
          width: buttonProps.fullWidth ? '100%' : buttonProps.sx?.width || 'auto',
        }}
      >
        {loading ? loadingText : children}
      </Button>
    </Box>
  );
};

export default LoadingButton; 