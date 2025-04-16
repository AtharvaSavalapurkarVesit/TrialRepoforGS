import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Skeleton,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [activeListings, setActiveListings] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [boughtItems, setBoughtItems] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [delistedItems, setDelistedItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    collegeName: '',
    address: '',
    pincode: ''
  });
  const [delistDialogOpen, setDelistDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [delistLoading, setDelistLoading] = useState(false);
  const [relistLoading, setRelistLoading] = useState(false);
  const [relistItemId, setRelistItemId] = useState(null);

  const handleRemoveFromWatchlist = async (itemId) => {
    try {
      await api.delete(`/api/users/watchlist/${itemId}`);
      setWatchlist(prevWatchlist => prevWatchlist.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item from watchlist:', error);
      setError(error.response?.data?.message || 'Error removing item from watchlist');
    }
  };

  const handleDelistItem = async (itemId) => {
    setDelistLoading(true);
    try {
      // Update item status to make it unavailable
      await api.put(`/api/items/${itemId}`, { status: 'unavailable' });
      
      // Remove from active listings
      setActiveListings(prevListings => 
        prevListings.filter(item => item._id !== itemId)
      );
      
      setError(null);
      setDelistDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error delisting item:', error);
      setError(error.response?.data?.message || 'Error delisting item. Please try again.');
    } finally {
      setDelistLoading(false);
    }
  };

  const openDelistDialog = (item) => {
    setItemToDelete(item);
    setDelistDialogOpen(true);
  };

  const closeDelistDialog = () => {
    setDelistDialogOpen(false);
    setItemToDelete(null);
  };

  const handleRelistItem = async (itemId) => {
    setRelistLoading(true);
    setRelistItemId(itemId);
    try {
      // Call the relist endpoint
      const response = await api.put(`/api/items/${itemId}/relist`);
      
      // Move the item from delisted to active listings
      setDelistedItems(prev => prev.filter(item => item._id !== itemId));
      setActiveListings(prev => [...prev, response.data]);
      
      setError(null);
    } catch (error) {
      console.error('Error relisting item:', error);
      setError(error.response?.data?.message || 'Error relisting item. Please try again.');
    } finally {
      setRelistLoading(false);
      setRelistItemId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [
          listingsResponse, 
          soldResponse, 
          boughtResponse, 
          watchlistResponse, 
          forumResponse, 
          profileResponse,
          delistedResponse
        ] = await Promise.all([
          api.get('/api/users/listings'),
          api.get('/api/users/sold-items'),
          api.get('/api/users/bought-items'),
          api.get('/api/users/watchlist'),
          api.get('/api/forum/posts/user'),
          api.get('/api/users/profile'),
          api.get('/api/users/delisted-items')
        ]);

        setActiveListings(listingsResponse.data);
        setSoldItems(soldResponse.data);
        setBoughtItems(boughtResponse.data);
        setWatchlist(watchlistResponse.data);
        setForumPosts(forumResponse.data);
        setProfileData(profileResponse.data);
        setDelistedItems(delistedResponse.data);
        setProfileFormData({
          firstName: profileResponse.data.firstName || '',
          lastName: profileResponse.data.lastName || '',
          email: profileResponse.data.email || '',
          contactNumber: profileResponse.data.contactNumber || '',
          collegeName: profileResponse.data.collegeName || '',
          address: profileResponse.data.address || '',
          pincode: profileResponse.data.pincode || ''
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const errorMessage = error.response?.data?.message || 'Error loading dashboard data. Please try refreshing the page.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getImageUrl = (photo) => {
    if (!photo) return '/placeholder-image.svg';
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/uploads')) return photo;
    const filename = photo.split('/').pop();
    return `/uploads/items/${filename}`;
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  const renderSkeletonCard = () => (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" width="100%" height={36} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    </Grid>
  );

  const renderItemCard = (item) => (
    <Grid item xs={12} sm={6} md={4} key={item._id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', paddingTop: '75%' /* 4:3 aspect ratio */ }}>
          <CardMedia
            component="img"
            image={getImageUrl(item.photos?.[0])}
            onError={handleImageError}
            alt={item.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#f5f5f5',
              padding: '2%'
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: '3%' }}>
            ₹{item.price}
          </Typography>
          
          {/* Show buyer information for sold items */}
          {activeTab === 1 && item.buyer && (
            <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                Sold to:
              </Typography>
              <Typography variant="body2">
                {item.buyer.firstName} {item.buyer.lastName}
              </Typography>
              {item.buyer.email && (
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  {item.buyer.email}
                </Typography>
              )}
              {item.buyer.contactNumber && (
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  {item.buyer.contactNumber}
                </Typography>
              )}
              {item.soldAt && (
                <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5, color: 'text.secondary' }}>
                  Sold on: {new Date(item.soldAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}
          
          <Box sx={{ mt: 'auto', width: '100%' }}>
            <Button
              component={Link}
              to={`/items/${item._id}`}
              variant="contained"
              sx={{ width: '100%', mb: '3%' }}
            >
              View Details
            </Button>
            {activeTab === 0 && (
              <Button
                variant="outlined"
                color="error"
                sx={{ width: '100%' }}
                onClick={() => openDelistDialog(item)}
              >
                Delist Item
              </Button>
            )}
            {activeTab === 6 && (
              <Button
                variant="outlined"
                color="primary"
                sx={{ width: '100%' }}
                onClick={() => handleRelistItem(item._id)}
                disabled={relistLoading && relistItemId === item._id}
              >
                {relistLoading && relistItemId === item._id ? 'Relisting...' : 'Relist Item'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderForumPost = (post) => (
    <Grid item xs={12} key={post._id}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ 
            fontSize: { xs: '1rem', sm: '1.25rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {post.content}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: '3%', flexWrap: 'wrap', gap: '3%' }}>
            <Typography variant="body2" color="text.secondary">
              {post.replies?.length || 0} replies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.likes?.length || 0} likes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posted on {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/forum"
            variant="outlined"
            sx={{ mt: '3%', width: { xs: '100%', sm: 'auto' } }}
          >
            View in Forum
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  const getProfilePicUrl = (path) => {
    if (!path) return '/placeholder-profile.jpg';
    if (path.startsWith('http')) return path;
    return `/${path}`; // Assuming path is relative from server root
  };

  const handleProfilePictureChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePicture(event.target.files[0]);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData({
      ...profileFormData,
      [name]: value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append form fields
      Object.keys(profileFormData).forEach(key => {
        formData.append(key, profileFormData[key]);
      });
      
      // Append profile picture if selected
      if (profilePicture) {
        formData.append('profilePic', profilePicture);
      }
      
      const response = await api.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileData(response.data);
      setEditMode(false);
      setError(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ px: { xs: '3%', sm: '2%' } }}>
        <Box sx={{ 
          my: { xs: '8%', sm: '6%', md: '4%' }, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <CircularProgress sx={{ mb: '3%' }} />
          <Typography>Loading your dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: '3%', sm: '2%' } }}>
      <Box sx={{ my: { xs: '5%', sm: '4%', md: '3%' } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Welcome, {user?.firstName}!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: '3%' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: '3%' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              '& .MuiTab-root': { 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: '5rem' },
                px: { xs: '2%', sm: '1rem' }
              } 
            }}
          >
            <Tab label="Active Listings" />
            <Tab label="Sold Items" />
            <Tab label="Bought Items" />
            <Tab label="Watchlist" />
            <Tab label="Forum Posts" />
            <Tab label="Delisted Items" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', sm: 'space-between' }, 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'center', sm: 'flex-start' },
              mb: '3%' 
            }}>
              <Typography variant="h5" sx={{ mb: { xs: '3%', sm: 0 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Your Active Listings
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/create-listing"
                sx={{ width: { xs: '80%', sm: 'auto' } }}
              >
                Create New Listing
              </Button>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {activeListings.length > 0 ? (
                activeListings.map(renderItemCard)
              ) : (
                <Grid item xs={12}>
                  <Typography align="center">No active listings</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {activeTab === 1 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Your Sold Items
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {soldItems.length > 0 ? (
                soldItems.map(renderItemCard)
              ) : (
                <Grid item xs={12}>
                  <Typography align="center">No sold items</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {activeTab === 2 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Your Bought Items
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {boughtItems.length > 0 ? (
                boughtItems.map(renderItemCard)
              ) : (
                <Grid item xs={12}>
                  <Typography align="center">No bought items</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {activeTab === 3 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Your Watchlist
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {watchlist.length > 0 ? (
                watchlist.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                        <CardMedia
                          component="img"
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            backgroundColor: '#f5f5f5',
                            padding: '2%'
                          }}
                          image={getImageUrl(item.photos?.[0])}
                          onError={handleImageError}
                          alt={item.name}
                        />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ 
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          ₹{item.price}
                        </Typography>
                        <Box sx={{ mt: 'auto', width: '100%', display: 'flex', gap: '2%' }}>
                          <Button
                            component={Link}
                            to={`/items/${item._id}`}
                            variant="contained"
                            fullWidth
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ minWidth: { xs: '30%', sm: '25%' } }}
                            onClick={() => handleRemoveFromWatchlist(item._id)}
                          >
                            Remove
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography align="center" color="textSecondary">
                    No items in watchlist
                  </Typography>
                  <Box sx={{ mt: '3%', display: 'flex', justifyContent: 'center' }}>
                    <Button
                      component={Link}
                      to="/"
                      variant="contained"
                      sx={{ width: { xs: '60%', sm: 'auto' } }}
                    >
                      Browse Items
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {activeTab === 4 && (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', sm: 'space-between' }, 
              alignItems: { xs: 'center', sm: 'flex-start' },
              flexDirection: { xs: 'column', sm: 'row' },
              mb: '3%' 
            }}>
              <Typography variant="h5" sx={{ mb: { xs: '3%', sm: 0 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Your Forum Posts
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/forum"
                sx={{ width: { xs: '80%', sm: 'auto' } }}
              >
                Create New Post
              </Button>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {forumPosts.length > 0 ? (
                forumPosts.map(renderForumPost)
              ) : (
                <Grid item xs={12}>
                  <Typography align="center">No forum posts yet</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {activeTab === 5 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Your Delisted Items
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {delistedItems.length > 0 ? (
                delistedItems.map(renderItemCard)
              ) : (
                <Grid item xs={12}>
                  <Typography align="center">No delisted items</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>

      {/* Delist confirmation dialog */}
      <Dialog
        open={delistDialogOpen}
        onClose={closeDelistDialog}
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '90%', sm: '80%', md: '60%' },
            maxWidth: '600px',
            p: { xs: '3%', sm: '2%' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Confirm Delisting</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to delist "{itemToDelete?.name}"? This will remove it from public listings.
            You can re-list it later from your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: '3%', pb: '3%' }}>
          <Button onClick={closeDelistDialog} disabled={delistLoading}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelistItem(itemToDelete?._id)} 
            color="error" 
            variant="contained"
            disabled={delistLoading}
          >
            {delistLoading ? 'Processing...' : 'Delist Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 