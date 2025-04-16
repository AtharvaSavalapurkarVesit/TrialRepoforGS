import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';  // Import API utility with proper authentication

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
  workingStatus: yup.string().when('category', {
    is: (category) => ['Devices', 'Sports Accessories', 'Art'].includes(category),
    then: () => yup.string().required('Working status is required for this category'),
    otherwise: () => yup.string(),
  }),
  missingParts: yup.string().required('Missing parts information is required'),
  price: yup.number().required('Price is required').positive('Price must be positive'),
  location: yup.string().required('Location is required'),
  isOriginalOwner: yup.boolean().required('Original owner status is required'),
  warrantyStatus: yup.string().required('Warranty status is required'),
  hasReceipt: yup.boolean().required('Receipt status is required'),
  mrp: yup.number().required('MRP is required').positive('MRP must be positive'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const CreateListing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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
      termsAccepted: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError('');

        if (photos.length < 1) {
          setError('Please upload at least 1 photo');
          setIsSubmitting(false);
          return;
        }

        // Check file sizes again before submission
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = photos.filter(file => file.size > maxFileSize);
        if (oversizedFiles.length > 0) {
          setError(`${oversizedFiles.length} file(s) exceed the 5MB size limit. Please remove them and try again.`);
          setIsSubmitting(false);
          return;
        }

        // Create a new FormData instance
        const formData = new FormData();
        
        // Log the values being sent
        console.log('Submitting form with values:', values);
        
        // Append all form fields
        Object.keys(values).forEach(key => {
          if (key === 'deliveryOptions') {
            formData.append(key, JSON.stringify(values[key]));
          } else if (typeof values[key] === 'boolean') {
            formData.append(key, values[key].toString());
          } else {
            formData.append(key, values[key]);
          }
        });

        // Append photos with better logging
        photos.forEach((photo, index) => {
          console.log(`Appending photo ${index+1}: ${photo.name} (${photo.size} bytes, ${photo.type})`);
          formData.append('photos', photo);
        });

        // Use API utility with improved error handling
        const response = await api.post('/api/items', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // Increase timeout to 60 seconds for file uploads
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        });

        console.log('Server response:', response.data);
        navigate('/dashboard');
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
        
        // Show more detailed error messages for specific issues
        if (error.message === 'Network Error') {
          setError('Network error. Please check your internet connection and try again.');
        } else if (error.code === 'ECONNABORTED') {
          setError('The request timed out. Your images may be too large or your connection is too slow.');
        } else if (error.response?.status === 413) {
          setError('The files you are trying to upload are too large. Please reduce their size and try again.');
        } else if (error.response?.status === 500 && error.response?.data?.message?.includes('directory')) {
          setError('Server error with file storage. Please try again or contact support if the problem persists.');
        } else {
          setError(
            error.response?.data?.message || 
            error.response?.data?.errors?.[0]?.msg || 
            'Failed to create listing. Please check your information and try again.'
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (photos.length + files.length > 5) {
      setError('You can only upload a maximum of 5 photos');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only JPG, PNG, and GIF are allowed.`);
      return;
    }
    
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setError('One or more files exceed the 5MB size limit.');
      return;
    }

    console.log('Valid files to upload:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    setPhotos([...photos, ...files]);
    setError('');
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Listing
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
                    error={formik.touched.workingStatus && Boolean(formik.errors.workingStatus)}
                    helperText={formik.touched.workingStatus && formik.errors.workingStatus}
                    required
                  />
                  {formik.values.category === 'Devices' && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                      Working status is required for Devices
                    </Typography>
                  )}
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
                  Photos (At least 1 required)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
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
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Listing'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateListing; 