import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  ImageList,
  ImageListItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  CircularProgress,
  IconButton,
  MobileStepper,
} from '@mui/material';
import {
  LocalShipping,
  Store,
  VerifiedUser,
  Receipt,
  Chat,
  ShoppingCart,
  RemoveFromQueue,
  AddToQueue,
  LocationOn,
  Info as InfoIcon,
  Edit,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomIn,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDistanceBetweenPincodes } from '../utils/pincode';
import { calculateShippingCharge } from '../utils/shippingCalculator';
import { LoadingButton } from '../components';
import api from '../utils/api'; // Import the API utility

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openChat, setOpenChat] = useState(false);
  const [message, setMessage] = useState('');
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [buyError, setBuyError] = useState(null);
  
  // Image gallery state
  const [activeStep, setActiveStep] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // Button loading states
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  
  // Distance calculation state
  const [distance, setDistance] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState(null);
  
  // Shipping charges state
  const [shippingCharges, setShippingCharges] = useState(null);

  // Image navigation handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => 
      prevActiveStep === (item?.photos?.length - 1) ? 0 : prevActiveStep + 1
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => 
      prevActiveStep === 0 ? (item?.photos?.length - 1) : prevActiveStep - 1
    );
  };

  const handleOpenFullscreen = (index) => {
    setFullscreenImage(index);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
  };

  // Keep the axios setup for timeout but use our API utility for actual requests
  useEffect(() => {
    // Add a request interceptor
    const interceptorId = axios.interceptors.request.use(
      (config) => {
        // Set a timeout for all requests
        config.timeout = 15000; // 15 seconds
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Clean up the interceptor when the component unmounts
    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, []);

  const fetchItemDetails = useCallback(async () => {
    try {
      console.log('Fetching item details for ID:', id);
      const response = await api.get(`/api/items/${id}`);
      console.log('Item details response:', response.data);
      setItem(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError(err.response?.data?.message || 'Error fetching item details');
      setLoading(false);
    }
  }, [id]);

  const checkIfInWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get(`/api/items/${id}/watchlist`);
      setIsInWatchlist(response.data.isInWatchlist);
    } catch (err) {
      console.error('Error checking watchlist status:', err);
    }
  }, [id, user]);

  const calculateDistance = useCallback(async () => {
    // Only calculate if we have a user and seller
    if (!user || !item || !item.seller) return;
    
    try {
      setDistanceLoading(true);
      setDistanceError(null);
      
      // Use the seller's ID to get their pincode from the database
      const sellerId = item.seller._id;
      
      // Get the buyer's pincode from the user object
      const buyerPincode = user.pincode;
      
      if (!buyerPincode) {
        console.log('Missing buyer pincode information');
        setDistanceError('Your pincode information is missing. Please update your profile.');
        setDistanceLoading(false);
        return;
      }
      
      console.log('Calculating distance to seller:', {
        buyerPincode,
        sellerId
      });
      
      // Calculate distance between pincodes
      const distanceData = await getDistanceBetweenPincodes(buyerPincode, null, sellerId);
      
      if (distanceData.error) {
        setDistanceError(distanceData.error);
        setShippingCharges(null);
      } else {
        // Log the detailed distance data for debugging
        console.log('Distance calculation result:', distanceData);
        
        // Calculate shipping charges based on the distance and item price
        const itemPrice = item.price || 0;
        const shipping = calculateShippingCharge(distanceData.distance, itemPrice);
        setShippingCharges(shipping);
        
        // Set the distance data in state
        setDistance(distanceData);
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
      setDistanceError('Failed to calculate distance');
      setShippingCharges(null);
    } finally {
      setDistanceLoading(false);
    }
  }, [user, item]);

  useEffect(() => {
    console.log('ItemDetail component mounted with ID:', id);
    if (id) {
      fetchItemDetails();
      checkIfInWatchlist();
    }
  }, [id, fetchItemDetails, checkIfInWatchlist]);

  // Calculate distance only once when item and user are available
  useEffect(() => {
    if (item && user && item.seller && user.id !== item.seller._id) {
      calculateDistance();
    }
  }, [item, user, calculateDistance]);

  const handleAddToWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent multiple clicks
    if (watchlistLoading) return;
    
    try {
      setWatchlistLoading(true);
      setError(null);
      
      // Set a timeout to handle potential network issues
      const timeoutId = setTimeout(() => {
        setWatchlistLoading(false);
        setError('Request is taking too long. Please try again.');
      }, 10000); // 10 seconds timeout
      
      if (isInWatchlist) {
        await api.delete(`/api/items/${id}/watchlist`);
        setIsInWatchlist(false);
      } else {
        await api.post(`/api/items/${id}/watchlist`);
        setIsInWatchlist(true);
      }
      
      // Clear timeout if request completes successfully
      clearTimeout(timeoutId);
    } catch (err) {
      console.error('Error updating watchlist:', err);
      // Specific error handling for network issues
      if (err.code === 'ECONNABORTED' || !err.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Error updating watchlist');
      }
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (item.seller._id === user.id) {
      alert("You can't chat with yourself as the seller");
      return;
    }
    
    // Prevent multiple clicks
    if (chatLoading) return;

    try {
      setChatLoading(true);
      setError(null);
      
      // Set a timeout to handle potential network issues
      const timeoutId = setTimeout(() => {
        setChatLoading(false);
        setError('Request is taking too long. Please try again.');
      }, 10000); // 10 seconds timeout
      
      const response = await api.post('/api/chats', {
        itemId: id,
        participantId: item.seller._id
      });
      
      // Clear timeout if request completes successfully
      clearTimeout(timeoutId);
      
      if (response.data && response.data._id) {
        navigate(`/chat/${response.data._id}`);
      } else {
        setError('Failed to create chat. Please try again.');
        setChatLoading(false);
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      // Specific error handling for network issues
      if (err.code === 'ECONNABORTED' || !err.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Error starting chat with seller');
      }
      setChatLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent multiple clicks
    if (buyLoading) return;

    try {
      setBuyLoading(true);
      setBuyError(null);
      
      // Set a timeout to handle potential network issues
      const timeoutId = setTimeout(() => {
        setBuyLoading(false);
        setBuyError('Request is taking too long. Please try again.');
      }, 10000); // 10 seconds timeout
      
      const response = await api.post(`/api/items/${id}/buy`);
      
      // Clear timeout if request completes successfully
      clearTimeout(timeoutId);

      // Close the dialog and navigate to bought items
      setOpenBuyDialog(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error buying item:', err);
      // Specific error handling for network issues
      if (err.code === 'ECONNABORTED' || !err.response) {
        setBuyError('Network error. Please check your connection and try again.');
      } else {
        setBuyError(err.response?.data?.message || 'Error purchasing item');
      }
      setBuyLoading(false);
    }
  };

  const getImageUrl = (photo) => {
    if (!photo) return '/placeholder-image.svg';
    // If it's already a full URL or starts with /, use it as is
    if (photo.startsWith('http') || photo.startsWith('/')) return photo;
    // For legacy data, extract the filename and construct the path
    const filename = photo.split('/').pop();
    return `/uploads/items/${filename}`;
  };

  // Add this new function to handle edit button click
  const handleEditClick = () => {
    if (item && item._id) {
      navigate(`/edit-item/${item._id}`);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            Loading item details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="info" sx={{ width: '100%', maxWidth: 600 }}>
            Item not found
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          {/* Main image display */}
          {item.photos && item.photos.length > 0 ? (
            <Box sx={{ position: 'relative' }}>
              <Paper 
                elevation={2}
                sx={{ 
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#f8f8f8',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(item.photos[activeStep])}
                  alt={`Product ${activeStep + 1}`}
                  sx={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    p: 2
                  }}
                  onClick={() => handleOpenFullscreen(activeStep)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.svg';
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  onClick={() => handleOpenFullscreen(activeStep)}
                >
                  <ZoomIn />
                </IconButton>
              </Paper>

              {/* Image navigation controls */}
              {item.photos.length > 1 && (
                <MobileStepper
                  variant="dots"
                  steps={item.photos.length}
                  position="static"
                  activeStep={activeStep}
                  sx={{ 
                    mt: 2, 
                    bgcolor: 'transparent', 
                    padding: 0,
                    justifyContent: 'center'
                  }}
                  nextButton={
                    <Button size="small" onClick={handleNext} sx={{ minWidth: '40px' }}>
                      <KeyboardArrowRight />
                    </Button>
                  }
                  backButton={
                    <Button size="small" onClick={handleBack} sx={{ minWidth: '40px' }}>
                      <KeyboardArrowLeft />
                    </Button>
                  }
                />
              )}

              {/* Thumbnail strip for desktop */}
              {item.photos.length > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    mt: 2,
                    pb: 1,
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '6px',
                    }
                  }}
                >
                  {item.photos.map((photo, index) => (
                    <Box
                      key={index}
                      onClick={() => setActiveStep(index)}
                      sx={{
                        minWidth: 80,
                        height: 80,
                        mr: 1,
                        border: index === activeStep ? '2px solid #0066CC' : '1px solid #ddd',
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: index === activeStep ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 1,
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(photo)}
                        alt={`Thumbnail ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.svg';
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Paper
              elevation={1}
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No images available
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {item.name}
            </Typography>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ₹{item.price}
              {item.isNegotiable && (
                <Chip
                  label="Negotiable"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1">
                Original MRP: ₹{item.mrp}
              </Typography>
              <Typography variant="subtitle1">
                Category: {item.category}
              </Typography>
              <Typography variant="subtitle1">
                Age: {item.age}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Item Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Condition:</strong> {item.condition}
              </Typography>
              {item.workingStatus && (
                <Typography variant="body1" gutterBottom>
                  <strong>Working Status:</strong> {item.workingStatus}
                </Typography>
              )}
              <Typography variant="body1" gutterBottom>
                <strong>Missing Parts:</strong> {item.missingParts}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Location:</strong> {item.location}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Delivery Options:</strong>
                <Box sx={{ pl: 2 }}>
                  {item.deliveryOptions.pickup && <Typography>• Pickup Available</Typography>}
                  {item.deliveryOptions.shipping && <Typography>• Shipping Available</Typography>}
                </Box>
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Original Owner:</strong> {item.isOriginalOwner ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Warranty Status:</strong> {item.warrantyStatus}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Receipt Available:</strong> {item.hasReceipt ? 'Yes' : 'No'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Seller Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {item.seller.firstName} {item.seller.lastName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Contact:</strong> {item.seller.contactNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {item.seller.email}
              </Typography>
              
              {/* Display buyer information if the current user is the seller and item is sold */}
              {user && user.id === item.seller._id && item.status === 'sold' && item.buyer && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    Buyer Information
                  </Typography>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'success.light', 
                    borderRadius: 1,
                    color: 'success.contrastText',
                    mb: 2
                  }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Name:</strong> {`${item.buyer.firstName || ''} ${item.buyer.lastName || ''}`}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Contact:</strong> {item.buyer.contactNumber || item.buyer.contact || 'Not available'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Email:</strong> {item.buyer.email || 'Not available'}
                    </Typography>
                    {item.soldAt && (
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        <strong>Sold on:</strong> {new Date(item.soldAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
              
              {user && user.id !== item.seller._id && (
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 1.5,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1
                }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="primary" sx={{ mr: 1 }} />
                    Distance Information
                  </Typography>
                  
                  {distanceLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>Calculating distance...</Typography>
                      <CircularProgress size={16} />
                    </Box>
                  ) : distanceError ? (
                    <Tooltip title={distanceError}>
                      <Typography variant="body2" color="text.secondary">
                        Distance information unavailable
                      </Typography>
                    </Tooltip>
                  ) : distance ? (
                    <Box>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {distance.distance} km {distance.note && 
                          <Typography component="span" variant="caption" sx={{ 
                            fontWeight: 'normal', 
                            opacity: 0.7,
                            ml: 0.5,
                            bgcolor: distance.note.includes('same') ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                            px: distance.note.includes('same') ? 1 : 0,
                            py: distance.note.includes('same') ? 0.5 : 0,
                            borderRadius: 1
                          }}>
                            {distance.note}
                          </Typography>
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        From your location ({distance.from.region}) to the seller's location ({distance.to.region})
                      </Typography>
                      <Tooltip title={
                        distance.note && distance.note.includes('same') 
                          ? `Local distance calculation between ${distance.from.pincode} and ${distance.to.pincode}` 
                          : `Calculated using coordinates based on pincode regions: ${distance.from.pincode} to ${distance.to.pincode}`
                      }>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5, cursor: 'help' }}>
                          <InfoIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {distance.note && distance.note.includes('same') 
                            ? 'Approximate distance within the same city/region' 
                            : 'Approximate distance based on pincode regions'}
                        </Typography>
                      </Tooltip>
                      
                      {/* Shipping charges section */}
                      {item.deliveryOptions.shipping && shippingCharges && (
                        <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocalShipping color="primary" sx={{ mr: 1, fontSize: 18 }} />
                            Estimated Shipping Charges ({shippingCharges.zone})
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Base Charge:</Typography>
                            <Typography variant="body2">₹{shippingCharges.baseCharge}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">GST (18%):</Typography>
                            <Typography variant="body2">₹{shippingCharges.gst}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, fontWeight: 'bold' }}>
                            <Typography variant="body2">Total Shipping:</Typography>
                            <Typography variant="body2" color="primary.main">₹{shippingCharges.total}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {shippingCharges.note}
                          </Typography>
                        </Box>
                      )}
                      {!item.deliveryOptions.shipping && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            Shipping not available for this item. Only pickup.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : null}
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
              {/* Remove the debug information */}
              
              {user && (
                // Simplify the seller check logic
                (user.id && item.seller._id && (
                  user.id === item.seller._id || 
                  user.id === item.seller._id.toString()
                )) || 
                (user._id && item.seller._id && (
                  user._id === item.seller._id ||
                  user._id === item.seller._id.toString()
                ))
              ) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditClick}
                  sx={{ 
                    height: 48,
                    borderRadius: '4px',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  startIcon={<Edit />}
                >
                  Edit Details
                </Button>
              )}
              {user && !(
                // Use the same simplified logic as above
                (user.id && item.seller._id && (
                  user.id === item.seller._id || 
                  user.id === item.seller._id.toString()
                )) || 
                (user._id && item.seller._id && (
                  user._id === item.seller._id ||
                  user._id === item.seller._id.toString()
                ))
              ) && item.status === 'available' && (
                <>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2,
                      '& .MuiButton-root': {
                        flex: 1,
                        height: 48  // Fixed height for all buttons
                      }
                    }}
                  >
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCart />}
                      onClick={() => setOpenBuyDialog(true)}
                      loading={buyLoading}
                      loadingText="Processing..."
                      sx={{ 
                        borderRadius: '4px',
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      Buy Now - ₹{item.price}
                      {item.deliveryOptions.shipping && shippingCharges && (
                        <Typography component="span" variant="caption" sx={{ ml: 1, display: 'block', fontSize: '0.7rem' }}>
                          (+ ₹{shippingCharges.total} shipping)
                        </Typography>
                      )}
                    </LoadingButton>
                    <LoadingButton
                      variant="contained"
                      startIcon={<Chat />}
                      onClick={handleStartChat}
                      loading={chatLoading}
                      loadingText="Connecting..."
                      sx={{ 
                        borderRadius: '4px',
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      Chat with Seller
                    </LoadingButton>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <LoadingButton
                      variant="outlined"
                      startIcon={isInWatchlist ? <RemoveFromQueue /> : <AddToQueue />}
                      onClick={handleAddToWatchlist}
                      disabled={isInWatchlist}
                      loading={watchlistLoading}
                      loadingText="Processing..."
                      sx={{ 
                        height: 48, 
                        width: '100%',
                        borderRadius: '4px',
                        fontWeight: 500,
                        boxShadow: isInWatchlist ? 'none' : '0 1px 3px rgba(0,0,0,0.08)'
                      }}
                    >
                      {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </LoadingButton>
                  </Box>
                </>
              )}

              {/* If the user is not logged in */}
              {!user && (
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  to="/login"
                  fullWidth
                  sx={{
                    height: 48,
                    fontWeight: 500,
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Login to Buy or Chat
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Buy Dialog */}
      <Dialog open={openBuyDialog} onClose={() => setOpenBuyDialog(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to buy this item?
            <br />
            <strong>{item.name}</strong> - ₹{item.price}
            {item.deliveryOptions.shipping && shippingCharges && (
              <> + ₹{shippingCharges.total} shipping</>
            )}
          </DialogContentText>
          {buyError && <Alert severity="error" sx={{ mt: 2 }}>{buyError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBuyDialog(false)} color="primary" disabled={buyLoading}
            sx={{ 
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            color="primary"
            loading={buyLoading}
            startIcon={<ShoppingCart />}
            sx={{ 
              minWidth: '160px', 
              height: '40px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontWeight: 500
            }}
            onClick={handleBuy}
          >
            Confirm Purchase
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Image Dialog */}
      <Dialog
        open={fullscreenImage !== null}
        onClose={handleCloseFullscreen}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {fullscreenImage !== null && item?.photos?.length > 0 && (
            <Box
              component="img"
              src={getImageUrl(item.photos[fullscreenImage])}
              alt={`Product fullscreen view`}
              sx={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.svg';
              }}
            />
          )}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <IconButton 
              onClick={() => setFullscreenImage(prev => 
                prev === 0 ? item.photos.length - 1 : prev - 1
              )}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <Typography color="white">
              {fullscreenImage !== null ? `${fullscreenImage + 1} / ${item.photos.length}` : ''}
            </Typography>
            <IconButton 
              onClick={() => setFullscreenImage(prev => 
                prev === item.photos.length - 1 ? 0 : prev + 1
              )}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ItemDetail; 