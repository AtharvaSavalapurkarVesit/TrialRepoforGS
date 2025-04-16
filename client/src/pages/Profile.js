import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  Grid, 
  TextField, 
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  Badge
} from '@mui/material';
import { Edit, Save, Cancel, Person, Email, Phone, Home, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || user.contact || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || user.contact || '',
        pincode: user.pincode || ''
      });
    }
    // Reset profile picture preview
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      
      // Add all profile data
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });
      
      // Add profile picture if selected
      if (profilePicture) {
        formData.append('profilePic', profilePicture);
      }
      
      const response = await api.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        // Update the user context with the new data
        if (typeof updateUser === 'function') {
          updateUser(response.data);
        }
        setSuccess(true);
        setEditing(false);
        setProfilePicture(null);
        setProfilePicturePreview(null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.msg || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProfilePicUrl = () => {
    if (profilePicturePreview) return profilePicturePreview;
    if (user?.profilePic) {
      const baseUrl = process.env.REACT_APP_API_URL || '';
      return `${baseUrl}/${user.profilePic}`;
    }
    return undefined;
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 4 }}>
          {editing ? (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  onClick={handleProfilePictureClick}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              }
            >
              <Avatar
                src={getProfilePicUrl()}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                sx={{ 
                  width: { xs: 100, sm: 120 }, 
                  height: { xs: 100, sm: 120 },
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                  mb: { xs: 2, sm: 0 },
                  mr: { sm: 4 },
                  cursor: 'pointer'
                }}
                onClick={handleProfilePictureClick}
              >
                {profileData.firstName?.[0]}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
              />
            </Badge>
          ) : (
            <Avatar
              src={getProfilePicUrl()}
              alt={`${user.firstName} ${user.lastName}`}
              sx={{ 
                width: { xs: 100, sm: 120 }, 
                height: { xs: 100, sm: 120 },
                fontSize: '3rem',
                bgcolor: 'primary.main',
                mb: { xs: 2, sm: 0 },
                mr: { sm: 4 }
              }}
            >
              {user.firstName?.[0]}
            </Avatar>
          )}
          
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 18 }} />
              {user.email}
            </Typography>
            {user.contactNumber && (
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 18 }} />
                {user.contactNumber}
              </Typography>
            )}
          </Box>
          
          {!editing && (
            <Button 
              variant="outlined" 
              startIcon={<Edit />} 
              onClick={handleEdit}
              sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 2, sm: 0 } }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {editing ? (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  fullWidth
                  disabled
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Number"
                  name="contactNumber"
                  value={profileData.contactNumber}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <Home sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Account Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {user.firstName} {user.lastName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Number
                  </Typography>
                  <Typography variant="body1">
                    {user.contactNumber || user.contact || 'Not provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pincode
                  </Typography>
                  <Typography variant="body1">
                    {user.pincode || 'Not provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default Profile; 