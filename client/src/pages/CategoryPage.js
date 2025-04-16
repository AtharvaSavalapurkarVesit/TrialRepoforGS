import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDistanceBetweenPincodes } from '../utils/pincode';

// Define the category mapping
const categoryMapping = {
  'books': 'Books',
  'notes': 'Notes',
  'stationary': 'Stationary',
  'clothes-and-costumes': 'Clothes & Costumes',
  'art': 'Art',
  'sports-accessories': 'Sports Accessories',
  'devices': 'Devices'
};

const CategoryPage = () => {
  const { category } = useParams();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [itemsWithDistance, setItemsWithDistance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceLoading, setDistanceLoading] = useState(false);

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'name_asc', label: 'Alphabetically (A-Z)' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'distance', label: 'Distance from Seller' }
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Get the proper category name from the mapping
        const properCategory = categoryMapping[category];
        
        if (!properCategory) {
          throw new Error('Invalid category');
        }
        
        const response = await axios.get(`/api/items/category/${properCategory}`);
        setItems(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err.message === 'Invalid category' 
          ? 'This category does not exist.' 
          : 'Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  useEffect(() => {
    const addDistanceToItems = async () => {
      if (!user || !user.pincode || !items.length) return;
      
      setDistanceLoading(true);
      
      try {
        // Process items in batches to avoid too many simultaneous requests
        const itemsWithDistanceData = [...items];
        
        for (let i = 0; i < itemsWithDistanceData.length; i++) {
          const item = itemsWithDistanceData[i];
          if (item.seller && item.seller.pincode) {
            try {
              const distanceData = await getDistanceBetweenPincodes(
                user.pincode, 
                item.seller.pincode,
                item.seller._id
              );
              
              itemsWithDistanceData[i] = {
                ...item,
                distanceData: distanceData
              };
            } catch (err) {
              console.error(`Error calculating distance for item ${item._id}:`, err);
              // Continue with other items even if one fails
              itemsWithDistanceData[i] = {
                ...item,
                distanceData: { distance: null, error: 'Could not calculate distance' }
              };
            }
          } else {
            // If seller has no pincode, can't calculate distance
            itemsWithDistanceData[i] = {
              ...item,
              distanceData: { distance: null, error: 'Seller location not available' }
            };
          }
        }
        
        setItemsWithDistance(itemsWithDistanceData);
      } catch (err) {
        console.error('Error processing distances:', err);
      } finally {
        setDistanceLoading(false);
      }
    };

    // Only calculate distances if user is logged in and items are loaded
    if (items.length > 0 && user && user.pincode) {
      addDistanceToItems();
    } else {
      // If no user or no pincode, just use the items as is
      setItemsWithDistance(items);
    }
  }, [items, user]);

  // Filter items based on search term
  const filteredItems = itemsWithDistance.filter(item => {
    return searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.seller && `${item.seller.firstName} ${item.seller.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Sort items based on selection
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'price_desc':
        return b.price - a.price;
      case 'price_asc':
        return a.price - b.price;
      case 'distance':
        // Put items with no distance at the end
        if (!a.distanceData?.distance) return 1;
        if (!b.distanceData?.distance) return -1;
        return a.distanceData.distance - b.distanceData.distance;
      default:
        return 0; // Keep original order
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box textAlign="center" py={4}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  const formatCategory = (cat) => {
    return categoryMapping[cat] || 'Unknown Category';
  };

  const getImageUrl = (photo) => {
    if (!photo) return '/placeholder-image.svg';
    // If it's already a full URL, use it
    if (photo.startsWith('http')) return photo;
    // If it starts with /uploads, use it directly
    if (photo.startsWith('/uploads')) return photo;
    // Extract the filename from the path
    const filename = photo.split('/').pop();
    return `/uploads/items/${filename}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 4, 
        gap: 2 
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 1, sm: 0 } }}>
          {formatCategory(category)}
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ 
            width: { xs: '100%', sm: 'auto' } 
          }}
        >
          <TextField
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: '200px' } }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', sm: '200px' } }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ ml: 1 }} />
                </InputAdornment>
              }
            >
              {sortOptions.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.value === 'distance' && (!user || !user.pincode)}
                >
                  {option.label}
                  {option.value === 'distance' && (!user || !user.pincode) && ' (Login required)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {filteredItems.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm ? 'No items match your search.' : 'No items found in this category.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sortedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', pt: '75%' }}>
                  <CardMedia
                    component="img"
                    image={item.photos && item.photos.length > 0 ? getImageUrl(item.photos[0]) : '/placeholder-image.svg'}
                    alt={item.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
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
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    ₹{item.price}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    by {item.seller.firstName} {item.seller.lastName}
                  </Typography>
                  {sortBy === 'distance' && user && user.pincode && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {item.distanceData?.distance 
                        ? `${item.distanceData.distance} km away` 
                        : 'Distance unavailable'}
                    </Typography>
                  )}
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button
                      component={Link}
                      to={`/items/${item._id}`}
                      variant="contained"
                      fullWidth
                      sx={{ 
                        borderRadius: '4px',
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategoryPage; 