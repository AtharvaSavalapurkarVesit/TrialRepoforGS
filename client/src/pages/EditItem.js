import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Books',
  'Notes',
  'Stationary',
  'Clothes & Costumes',
  'Art',
  'Sports Accessories',
  'Devices'
];

const validationSchema = yup.object({
  name: yup.string().required('Item name is required'),
  category: yup.string().required('Category is required'),
  age: yup.string().required('Item age is required'),
  condition: yup.string().required('Item condition is required'),
  missingParts: yup.string().required('Missing parts information is required'),
  price: yup.number().required('Price is required').positive('Price must be positive'),
  location: yup.string().required('Location is required'),
  isOriginalOwner: yup.boolean().required('Original owner status is required'),
  warrantyStatus: yup.string().required('Warranty status is required'),
  hasReceipt: yup.boolean().required('Receipt status is required'),
  mrp: yup.number().required('MRP is required').positive('MRP must be positive'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const EditItem = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [existingPhotos, setExistingPhotos] = useState([]);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Set token in axios defaults
    axios.defaults.headers.common['x-auth-token'] = token;
  }, [navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch the item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/api/items/${id}`);
        const itemData = response.data;
        
        // Check if the current user is the seller
        if (user && user.id !== itemData.seller._id) {
          setError('You are not authorized to edit this item');
          navigate(`/items/${id}`);
          return;
        }
        
        setItem(itemData);
        setExistingPhotos(itemData.photos || []);
        setLoadingItem(false);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to load item details');
        setLoadingItem(false);
      }
    };

    if (id && user) {
      fetchItem();
    }
  }, [id, user, navigate]);

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      age: '',
      condition: '',
      workingStatus: '',
      missingParts: '',
      price: '',
      isNegotiable: false,
      location: '',
      deliveryOptions: {
        pickup: true,
        shipping: false,
      },
      isOriginalOwner: false,
      warrantyStatus: '',
      hasReceipt: false,
      mrp: '',
      termsAccepted: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (existingPhotos.length + photos.length < 1) {
          setError('Please upload at least 1 photo');
          return;
        }

        // Get fresh token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to update a listing');
          navigate('/login');
          return;
        }

        // First update the item details
        const updateResponse = await axios.put(`/api/items/${id}`, {
          ...values,
          // Keep existing photos
          deliveryOptions: JSON.stringify(values.deliveryOptions),
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
        });
        
        // If there are new photos to upload, do it in a separate request
        if (photos.length > 0) {
          const formData = new FormData();
          photos.forEach((photo) => {
            formData.append('photos', photo);
          });
          
          await axios.post(`/api/items/${id}/photos`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-auth-token': token
            },
          });
        }

        navigate(`/items/${id}`);
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        setError(
          error.response?.data?.message || 
          error.response?.data?.errors?.[0]?.msg || 
          'Failed to update listing'
        );
      }
    },
  });

  // Set form values once item is loaded
  useEffect(() => {
    if (item) {
      formik.setValues({
        name: item.name || '',
        category: item.category || '',
        age: item.age || '',
        condition: item.condition || '',
        workingStatus: item.workingStatus || '',
        missingParts: item.missingParts || '',
        price: item.price || '',
        isNegotiable: item.isNegotiable || false,
        location: item.location || '',
        deliveryOptions: item.deliveryOptions || {
          pickup: true,
          shipping: false,
        },
        isOriginalOwner: item.isOriginalOwner || false,
        warrantyStatus: item.warrantyStatus || '',
        hasReceipt: item.hasReceipt || false,
        mrp: item.mrp || '',
        termsAccepted: true,
      });
    }
  }, [item]);

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Check total number of photos
    if (files.length + photos.length + existingPhotos.length > 4) {
      setError('Maximum 4 photos allowed');
      return;
    }
    
    // Validate file types
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      // Check if file is an image
      const fileType = file.type;
      if (fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });
    
    // Display error for invalid files
    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s): ${invalidFiles.join(', ')}. Please upload only jpg, jpeg, png, or gif images.`);
      
      // If some files are valid, add those
      if (validFiles.length > 0) {
        setPhotos(prevPhotos => [...prevPhotos, ...validFiles]);
      }
      return;
    }
    
    // Add valid files
    setPhotos(prevPhotos => [...prevPhotos, ...validFiles]);
    
    // Clear any previous errors if successful
    if (error && error.includes('file type')) {
      setError('');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
  };

  if (loadingItem) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Listing
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Item Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="age"
                  name="age"
                  label="How old is the item?"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  error={formik.touched.age && Boolean(formik.errors.age)}
                  helperText={formik.touched.age && formik.errors.age}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="condition"
                  name="condition"
                  label="Condition and any damages"
                  multiline
                  rows={3}
                  value={formik.values.condition}
                  onChange={formik.handleChange}
                  error={formik.touched.condition && Boolean(formik.errors.condition)}
                  helperText={formik.touched.condition && formik.errors.condition}
                />
              </Grid>

              {(formik.values.category === 'Sports Accessories' || 
                formik.values.category === 'Art' || 
                formik.values.category === 'Devices') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="workingStatus"
                    name="workingStatus"
                    label="Working Status"
                    value={formik.values.workingStatus}
                    onChange={formik.handleChange}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="missingParts"
                  name="missingParts"
                  label="Missing Parts or Accessories"
                  value={formik.values.missingParts}
                  onChange={formik.handleChange}
                  error={formik.touched.missingParts && Boolean(formik.errors.missingParts)}
                  helperText={formik.touched.missingParts && formik.errors.missingParts}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="mrp"
                  name="mrp"
                  label="Original MRP"
                  type="number"
                  value={formik.values.mrp}
                  onChange={formik.handleChange}
                  error={formik.touched.mrp && Boolean(formik.errors.mrp)}
                  helperText={formik.touched.mrp && formik.errors.mrp}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isNegotiable}
                      onChange={formik.handleChange}
                      name="isNegotiable"
                    />
                  }
                  label="Price is negotiable"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Item Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Delivery Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.deliveryOptions.pickup}
                      onChange={(e) => {
                        formik.setFieldValue('deliveryOptions.pickup', e.target.checked);
                      }}
                    />
                  }
                  label="Local Pickup"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.deliveryOptions.shipping}
                      onChange={(e) => {
                        formik.setFieldValue('deliveryOptions.shipping', e.target.checked);
                      }}
                    />
                  }
                  label="Shipping Available"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isOriginalOwner}
                      onChange={formik.handleChange}
                      name="isOriginalOwner"
                    />
                  }
                  label="I am the original owner"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="warrantyStatus"
                  name="warrantyStatus"
                  label="Warranty Status"
                  value={formik.values.warrantyStatus}
                  onChange={formik.handleChange}
                  error={formik.touched.warrantyStatus && Boolean(formik.errors.warrantyStatus)}
                  helperText={formik.touched.warrantyStatus && formik.errors.warrantyStatus}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.hasReceipt}
                      onChange={formik.handleChange}
                      name="hasReceipt"
                    />
                  }
                  label="I have the original receipt"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Existing Photos
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {existingPhotos.map((photo, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Item photo ${index + 1}`}
                        onError={(e) => {
                          console.error(`Error loading image for ${photo}`);
                          e.target.src = '/placeholder-image.jpg';
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '5px'
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => removeExistingPhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          minWidth: 'auto',
                          p: 0.5,
                          bgcolor: 'rgba(255,255,255,0.7)'
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Add New Photos (Total 4 maximum)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={existingPhotos.length + photos.length >= 4}
                >
                  Upload Photos
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {photos.map((photo, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        onError={(e) => {
                          console.error(`Error loading preview for ${photo.name}`);
                          e.target.src = '/placeholder-image.jpg';
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '5px'
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => removePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          minWidth: 'auto',
                          p: 0.5,
                          bgcolor: 'rgba(255,255,255,0.7)'
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.termsAccepted}
                      onChange={formik.handleChange}
                      name="termsAccepted"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept that I am responsible for any issues with the item and will handle exchanges if needed
                    </Typography>
                  }
                />
                {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                  <Typography color="error" variant="body2">
                    {formik.errors.termsAccepted}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    onClick={() => navigate(`/items/${id}`)}
                    variant="outlined"
                    fullWidth
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                  >
                    Update Listing
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditItem; 