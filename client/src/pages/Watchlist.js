import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';

const Watchlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/users/watchlist');
      setItems(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching watchlist');
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (itemId) => {
    try {
      await axios.delete(`/api/users/watchlist/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing item from watchlist');
    }
  };

  const getImageUrl = (photo) => {
    if (!photo) return '/placeholder-image.svg';
    // If it's already a full URL, use it
    if (photo.startsWith('http')) return photo;
    // Extract the filename from the path
    const filename = photo.split('/').pop();
    return `/uploads/items/${filename}`;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Watchlist
      </Typography>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Your watchlist is empty
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Browse Items
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {items.map((item) => (
            <Grid item key={item._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.photos && item.photos.length > 0 ? getImageUrl(item.photos[0]) : '/placeholder-image.svg'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.svg';
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {item.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFromWatchlist(item._id)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <Typography>
                    Category: {item.category}
                  </Typography>
                  <Typography>
                    Price: ₹{item.price}
                  </Typography>
                  <Typography>
                    Condition: {item.condition}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      to={`/items/${item._id}`}
                      variant="contained"
                      fullWidth
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

export default Watchlist; 