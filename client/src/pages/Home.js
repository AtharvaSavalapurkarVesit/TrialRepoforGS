import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Box,
  Chip,
  Skeleton,
  Paper,
  Pagination,
  InputBase,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getDistanceBetweenPincodes } from '../utils/pincode';

// Define API_URL directly
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const Home = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [distances, setDistances] = useState({});
  const [distanceLoading, setDistanceLoading] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const itemsPerPage = isSmallScreen ? 4 : isMediumScreen ? 8 : 12;

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/items`);
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.location && item.location.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    }
    setPage(1);
  }, [searchQuery, items]);

  const calculateDistance = useCallback(async (userPincode, sellerPincode, itemId) => {
    if (!userPincode || !sellerPincode || userPincode === sellerPincode) return;
    
    // Check if distance is already calculated
    if (distances[itemId]) return;
    
    try {
      setDistanceLoading(prev => ({ ...prev, [itemId]: true }));
      const distance = await getDistanceBetweenPincodes(userPincode, sellerPincode);
      setDistances(prev => ({ ...prev, [itemId]: distance }));
    } catch (err) {
      console.error('Error calculating distance:', err);
    } finally {
      setDistanceLoading(prev => ({ ...prev, [itemId]: false }));
    }
  }, [distances]);

  const getImageUrl = (path) => {
    if (!path) return '/placeholder-image.svg';
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with a single slash and handle both items and profile-pics paths
    let formattedPath = path;
    if (path.startsWith('/')) {
      formattedPath = path.substring(1); // Remove leading slash if present
    }
    
    // Ensure the path is complete for items and profile-pics
    if (!formattedPath.includes('uploads/')) {
      if (formattedPath.includes('profile-pics/')) {
        formattedPath = `uploads/${formattedPath}`;
      } else if (formattedPath.includes('items/')) {
        formattedPath = `uploads/${formattedPath}`;
      }
    }
    
    return `${API_URL}/${formattedPath}`;
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSkeletonCards = () => {
    return Array(itemsPerPage).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          }
        }}>
          <Skeleton variant="rectangular" height={200} animation="wave" />
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Skeleton variant="text" height={28} width="80%" animation="wave" />
            <Skeleton variant="text" height={24} width="50%" animation="wave" />
            <Skeleton variant="text" height={20} width="70%" animation="wave" />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" height={24} width={60} animation="wave" />
              <Skeleton variant="rounded" height={24} width={60} animation="wave" />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const renderItemCards = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    if (currentItems.length === 0 && !loading) {
      return (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6">No items found matching your search.</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search terms or browse categories instead.
            </Typography>
          </Paper>
        </Grid>
      );
    }

    return currentItems.map((item) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          }
        }}>
          <CardActionArea 
            component={RouterLink} 
            to={user ? `/items/${item._id}` : '/login'}
            sx={{ display: 'block' }}
          >
            <Box sx={{ position: 'relative', pt: '65%', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                image={item.photos && item.photos.length > 0 ? getImageUrl(item.photos[0]) : '/placeholder-image.svg'}
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.svg';
                }}
              />
              {!user && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0,
                  m: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  Login to view
                </Box>
              )}
            </Box>
          </CardActionArea>
            
          <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                fontSize: '1.1rem',
                mb: 0.5,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                height: '2.8rem'
              }}
            >
              {item.name}
            </Typography>
            
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                fontWeight: 700, 
                mt: 0.5, 
                mb: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              ₹{item.price}
              {item.isNegotiable && (
                <Chip 
                  label="Negotiable" 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    height: '20px', 
                    fontSize: '0.65rem',
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                    color: 'primary.main',
                    fontWeight: 500
                  }} 
                />
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={item.category} 
                size="small" 
                sx={{ 
                  fontSize: '0.7rem',
                  bgcolor: 'rgba(0,0,0,0.06)',
                  color: 'text.secondary'
                }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {item.location || 'Location N/A'}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              component={RouterLink}
              to={user ? `/items/${item._id}` : '/login'}
              fullWidth
              sx={{
                mt: 'auto',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {!user && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 4, 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1">Sign in to get full access, view detailed information, and contact sellers.</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to="/login" 
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: '6px',
                  px: 2
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/register" 
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: '6px',
                  px: 2
                }}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Alert>
      )}
      
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mb: 3,
          fontWeight: 700,
          color: 'text.primary'
        }}
      >
        Browse Items
      </Typography>
      
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <SearchIcon sx={{ p: '10px', color: 'action.active' }} />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search by name, category, or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading ? renderSkeletonCards() : renderItemCards()}
      </Grid>

      {filteredItems.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredItems.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isSmallScreen ? 'small' : 'medium'}
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 500,
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default Home; 