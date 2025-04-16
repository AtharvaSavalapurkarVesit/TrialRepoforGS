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
  Paper,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { Person, Lock, School, LocalLibrary, Devices, ShoppingBag } from '@mui/icons-material';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

const Login = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError('');
        
        const result = await login(values.email, values.password);
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Login failed. Please check your credentials and try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError(error.message || 'Login failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 2, md: 6 }
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 4 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                  color: 'primary.main'
                }}
              >
                Welcome to GarageSale
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  mb: 2,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  maxWidth: '90%',
                  mx: { xs: 'auto', md: 0 }
                }}
              >
                Your campus marketplace for buying and selling college essentials
              </Typography>
            </Box>

            <Paper 
              elevation={3} 
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                maxWidth: { xs: '100%', md: '85%' }
              }}
            >
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                align="center"
                sx={{ mb: 3, fontWeight: 600 }}
              >
                Sign in to your account
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: <Person color="action" sx={{ mr: 1 }} />
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: <Lock color="action" sx={{ mr: 1 }} />
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting || authLoading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    position: 'relative'
                  }}
                >
                  {(isSubmitting || authLoading) ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    New to GarageSale?
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    Create an Account
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {!isMobile && (
            <Grid 
              item 
              md={6}
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
                  maxWidth: '500px',
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                }}
              >
                <img
                  src="/login.jpg"
                  alt="Campus marketplace"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 6, width: '100%', maxWidth: '500px' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Why choose GarageSale?
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <School sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                      <Typography>College community</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalLibrary sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                      <Typography>Academic resources</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Devices sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                      <Typography>Electronics & tech</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ShoppingBag sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                      <Typography>Secure transactions</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Login; 