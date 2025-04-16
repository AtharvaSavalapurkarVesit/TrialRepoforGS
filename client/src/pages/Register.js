import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Grid,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { 
  Person, 
  Email, 
  Phone, 
  Home, 
  Lock, 
  School, 
  AccountCircle, 
  PhotoCamera,
  ArrowBack
} from '@mui/icons-material';

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  username: yup
    .string()
    .required('Username is required'),
  collegeName: yup
    .string()
    .required('College name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  contactNumber: yup
    .string()
    .required('Contact number is required'),
  pincode: yup
    .string()
    .required('Pincode is required'),
  address: yup
    .string()
    .required('Address is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register = () => {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      collegeName: '',
      email: '',
      contactNumber: '',
      pincode: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError('');
        
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (key !== 'confirmPassword') {
            formData.append(key, values[key]);
          }
        });
        if (profilePic) {
          formData.append('profilePic', profilePic);
        }

        const success = await register(formData);
        if (success) {
          navigate('/dashboard');
        } else {
          setError('Registration failed. Please check your information and try again.');
        }
      } catch (error) {
        setError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: isMobile ? 'none' : 'linear-gradient(to right, #ffffff 50%, #f5f5f5 50%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={0} justifyContent="center">
          {!isMobile && (
            <Grid 
              item 
              md={5}
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '450px',
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  mb: 4
                }}
              >
                <img
                  src="/register.jpg"
                  alt="Campus marketplace"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              
              <Box sx={{ width: '100%', maxWidth: '450px' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Join GarageSale today!
                </Typography>
                <Typography variant="body1" paragraph>
                  Connect with fellow students to buy and sell essential college items. From textbooks to electronics, 
                  find everything you need for your academic journey at student-friendly prices.
                </Typography>
                <Typography variant="body1">
                  Already have an account?
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  sx={{ mt: 2 }}
                >
                  Back to Login
                </Button>
              </Box>
            </Grid>
          )}
          
          <Grid 
            item 
            xs={12} 
            md={7} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 2, md: 4 }
            }}
          >
            <Paper 
              elevation={3} 
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                align="center"
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: 'primary.main' 
                }}
              >
                Create your account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{ width: '100%' }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1px solid #ddd',
                      position: 'relative',
                      mb: 2,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <AccountCircle sx={{ color: 'grey.400', fontSize: 80 }} />
                    )}
                  </Box>
                  
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    size="small"
                  >
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      InputProps={{
                        startAdornment: <Person color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      InputProps={{
                        startAdornment: <Person color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      InputProps={{
                        startAdornment: <AccountCircle color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      error={formik.touched.username && Boolean(formik.errors.username)}
                      helperText={formik.touched.username && formik.errors.username}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="collegeName"
                      label="College Name"
                      name="collegeName"
                      InputProps={{
                        startAdornment: <School color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.collegeName}
                      onChange={formik.handleChange}
                      error={formik.touched.collegeName && Boolean(formik.errors.collegeName)}
                      helperText={formik.touched.collegeName && formik.errors.collegeName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      InputProps={{
                        startAdornment: <Email color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="contactNumber"
                      label="Contact Number"
                      name="contactNumber"
                      InputProps={{
                        startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.contactNumber}
                      onChange={formik.handleChange}
                      error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                      helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="pincode"
                      label="Pincode"
                      name="pincode"
                      InputProps={{
                        startAdornment: <Home color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.pincode}
                      onChange={formik.handleChange}
                      error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                      helperText={formik.touched.pincode && formik.errors.pincode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="address"
                      label="Address"
                      name="address"
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: <Home color="action" sx={{ mr: 1, mt: 1 }} />
                      }}
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      InputProps={{
                        startAdornment: <Lock color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      InputProps={{
                        startAdornment: <Lock color="action" sx={{ mr: 1 }} />
                      }}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                      helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting || authLoading}
                  sx={{ 
                    mt: 4, 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  {(isSubmitting || authLoading) ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {isMobile && (
                  <>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        or
                      </Typography>
                    </Divider>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        Already have an account?
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/login"
                        variant="outlined"
                        fullWidth
                      >
                        Sign In
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register; 