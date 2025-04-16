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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import axios from 'axios';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const filterItems = (item) => {
    const matchesCategory = !category || item.category === category;
    const matchesPrice = !priceRange || getPriceRange(item.price) === priceRange;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesPrice && matchesSearch;
  };

  const getPriceRange = (price) => {
    if (price < 500) return 'under500';
    if (price < 1000) return 'under1000';
    if (price < 2000) return 'under2000';
    return 'over2000';
  };

  const categories = [
    'Books',
    'Notes',
    'Stationary',
    'Clothes & Costumes',
    'Art',
    'Sports Accessories',
    'Devices'
  ];

  const priceRanges = [
    { value: 'under500', label: 'Under ₹500' },
    { value: 'under1000', label: '₹500 - ₹1000' },
    { value: 'under2000', label: '₹1000 - ₹2000' },
    { value: 'over2000', label: 'Over ₹2000' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceRange}
                label="Price Range"
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <MenuItem value="">All Prices</MenuItem>
                {priceRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {items.filter(filterItems).map((item) => (
          <Grid item key={item._id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={item.photos[0] || '/placeholder.png'}
                alt={item.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {item.name}
                </Typography>
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
    </Container>
  );
};

export default ItemList; 