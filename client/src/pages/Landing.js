import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
  Stack,
  CardMedia
} from '@mui/material';
import {
  School,
  LocalLibrary,
  Devices,
  ShoppingBag,
  SavingsOutlined,
  PeopleAlt,
  LocalShipping,
  Verified
} from '@mui/icons-material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Feature = ({ icon, title, description }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3 }}>
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          height: { xs: '70vh', md: '75vh' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.6)), url('/beforelogin.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          color: 'white',
          mb: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'brightness(1.05) contrast(1.05)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}
              >
                Welcome to GarageSale
              </Typography>
              <Typography 
                variant="h5" 
                component="p" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Buy and sell second-hand items easily within your community.
                Save money, reduce waste, and find unique treasures.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
              >
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontWeight: 'bold',
                    borderRadius: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontWeight: 'bold',
                    color: 'white',
                    borderColor: 'white',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    },
                    borderRadius: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  Create Account
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          fontWeight="bold" 
          sx={{ mb: 4 }}
        >
          How GarageSale Works
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                List Your Items
              </Typography>
              <Typography sx={{ 
                width: '100%', 
                wordWrap: 'break-word',
                overflow: 'visible'
              }}>
                Take photos, write descriptions, and set your price. 
                Make your unused items available to people who need them.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3
              }}
            >
              <LocalShipping sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                Connect & Deliver
              </Typography>
              <Typography sx={{ 
                width: '100%', 
                wordWrap: 'break-word',
                overflow: 'visible'
              }}>
                Chat with buyers or sellers, arrange delivery or pickup,
                and complete transactions safely within your community.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                Save Money
              </Typography>
              <Typography sx={{ 
                width: '100%', 
                wordWrap: 'break-word',
                overflow: 'visible'
              }}>
                Find great deals on used items, negotiate prices,
                and contribute to a sustainable circular economy.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.100' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            textAlign="center" 
            fontWeight="bold" 
            sx={{ 
              mb: 5,
              width: '100%',
              wordWrap: 'break-word',
              overflow: 'visible'
            }}
          >
            Why Choose GarageSale?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: '40%' },
                    height: { xs: 220, md: 'auto' },
                    objectFit: 'cover'
                  }}
                  image="/communityfocus.jpg"
                  alt="Local community"
                />
                <CardContent sx={{ 
                  flex: '1 0 auto', 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: { xs: '100%', md: '60%' }
                }}>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    Local Community Focus
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    width: '100%',
                    wordWrap: 'break-word'
                  }}>
                    Trade with people in your neighborhood. GarageSale connects 
                    you directly with buyers and sellers in your community, making 
                    transactions more personal and convenient.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: '40%' },
                    height: { xs: 220, md: 'auto' },
                    objectFit: 'cover'
                  }}
                  image="/ecofriendly.jpg"
                  alt="Sustainable shopping"
                />
                <CardContent sx={{ 
                  flex: '1 0 auto', 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: { xs: '100%', md: '60%' }
                }}>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    Eco-Friendly Shopping
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    width: '100%',
                    wordWrap: 'break-word'
                  }}>
                    Reduce waste and your carbon footprint by giving items a second life.
                    Every purchase on GarageSale helps keep usable goods out of landfills
                    and promotes sustainable consumption.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 8, 
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            fontWeight="bold" 
            sx={{ mb: 3 }}
          >
            Ready to Join GarageSale?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Create your account today and start buying or selling pre-loved items in your community.
          </Typography>
          <Button 
            component={RouterLink} 
            to="/register" 
            variant="contained" 
            size="large"
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
              borderRadius: 2
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 