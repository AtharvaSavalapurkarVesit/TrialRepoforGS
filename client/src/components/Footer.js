import React from 'react';
import { Box, Container, Typography, Link, Divider, Button, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Feedback, Forum } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        px: { xs: 1.5, sm: 2 },
        mt: 'auto',
        backgroundColor: '#f5f5f7',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        {/* User Experience Section */}
        <Box 
          sx={{ 
            mb: { xs: 3, sm: 4 }, 
            p: { xs: 2, sm: 2.5, md: 3 }, 
            bgcolor: 'rgba(255, 255, 255, 0.7)', 
            borderRadius: { xs: 1.5, sm: 2 },
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 }
          }}
        >
          <Box sx={{ mb: { xs: 1.5, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              sx={{ 
                color: '#1d1d1f',
                fontSize: { xs: '16px', sm: '18px' },
                fontWeight: 600
              }}
            >
              User Experience
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#86868b',
                fontSize: { xs: '12px', sm: '14px' }
              }}
            >
              We're constantly improving. Share your thoughts or ask questions.
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            flexDirection: { xs: isMobile ? 'column' : 'row', sm: 'row' }
          }}>
            <Button
              component={RouterLink}
              to="/feedback"
              startIcon={<Feedback />}
              fullWidth={isMobile}
              size={isMobile ? "small" : "medium"}
              sx={{
                backgroundColor: '#0066CC',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#0052a3',
                },
                borderRadius: { xs: '6px', sm: '8px' },
                py: { xs: 0.7, sm: 1 },
                fontWeight: 500,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}
            >
              Share Feedback
            </Button>
            <Button
              component={RouterLink}
              to="/forum"
              startIcon={<Forum />}
              fullWidth={isMobile}
              size={isMobile ? "small" : "medium"}
              sx={{
                borderColor: '#0066CC',
                color: '#0066CC',
                borderWidth: 1,
                borderStyle: 'solid',
                '&:hover': {
                  borderColor: '#0052a3',
                  color: '#0052a3',
                  backgroundColor: 'rgba(0, 102, 204, 0.05)'
                },
                borderRadius: { xs: '6px', sm: '8px' },
                py: { xs: 0.7, sm: 1 },
                fontWeight: 500,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}
              variant="outlined"
            >
              Ask in Forum
            </Button>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          gap: { xs: 3, sm: 4, md: 6 } 
        }}>
          {/* About Us Section */}
          <Box sx={{ flex: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1d1d1f',
                fontSize: { xs: '18px', sm: '20px' },
                fontWeight: 600,
                mb: { xs: 1, sm: 2 }
              }}
            >
              About us
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#86868b',
                lineHeight: 1.6,
                fontSize: { xs: '13px', sm: '14px' },
                maxWidth: 600 
              }}
            >
              We're four second-year engineering students building a platform for students to easily buy and sell pre-loved stuff. 
              From books to electronics, our goal is to make campus life more affordable and sustainable. 
              It's student-to-student, simple, and budget-friendly. Save money, make money — all in one place.
            </Typography>
          </Box>

          {/* Contact Info Section */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1d1d1f',
                fontSize: { xs: '18px', sm: '20px' },
                fontWeight: 600,
                mb: { xs: 1, sm: 2 }
              }}
            >
              Contact info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="tel:+919773366677" 
                sx={{ 
                  color: '#06c',
                  textDecoration: 'none',
                  fontSize: { xs: '13px', sm: '14px' },
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                +91 9773366677
              </Link>
              <Link 
                href="mailto:2023.parth.chavan@ves.ac.in" 
                sx={{ 
                  color: '#06c',
                  textDecoration: 'none',
                  fontSize: { xs: '13px', sm: '14px' },
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                2023.parth.chavan@ves.ac.in
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 3, sm: 4 }, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            color: '#86868b',
            fontSize: { xs: '10px', sm: '12px' }
          }}
        >
          © {new Date().getFullYear()} GarageSale. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 