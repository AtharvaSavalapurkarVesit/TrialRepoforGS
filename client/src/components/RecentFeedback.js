import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Rating, 
  Chip, 
  Divider, 
  CircularProgress, 
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Feedback, ArrowForward } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const RecentFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Categories for feedback with their colors
  const categories = [
    { value: 'general', label: 'General', color: '#9c27b0' },
    { value: 'ui', label: 'User Interface', color: '#2196f3' },
    { value: 'feature', label: 'Feature Request', color: '#4caf50' },
    { value: 'bug', label: 'Bug Report', color: '#f44336' },
    { value: 'performance', label: 'Performance', color: '#ff9800' }
  ];

  useEffect(() => {
    fetchRecentFeedbacks();
  }, []);

  const fetchRecentFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Remove auth token to make this a public request
      const authToken = axios.defaults.headers.common['x-auth-token'];
      delete axios.defaults.headers.common['x-auth-token'];
      
      try {
        const response = await axios.get('/api/feedback?limit=4');
        setFeedbacks(response.data);
      } finally {
        // Restore the auth token if it existed
        if (authToken) {
          axios.defaults.headers.common['x-auth-token'] = authToken;
        }
      }
    } catch (error) {
      console.error('Error fetching recent feedbacks:', error);
      setError('Could not load recent feedback');
    } finally {
      setLoading(false);
    }
  };

  // Function to get color for category chip
  const getCategoryColor = (categoryValue) => {
    const found = categories.find(cat => cat.value === categoryValue);
    return found ? found.color : '#9e9e9e';
  };

  // Function to get label for category chip
  const getCategoryLabel = (categoryValue) => {
    const found = categories.find(cat => cat.value === categoryValue);
    return found ? found.label : categoryValue;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Truncate long content
  const truncateContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 200 
        }}
      >
        <CircularProgress size={isMobile ? 30 : 40} />
      </Box>
    );
  }

  if (error) {
    return null; // Hide component on error
  }

  if (feedbacks.length === 0) {
    return null; // Hide if no feedbacks
  }

  return (
    <Box 
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        backgroundColor: '#f8f9fa',
        borderRadius: { xs: 0, sm: 2 },
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          px: { xs: 2, sm: 4, md: 6 },
          mb: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              position: 'relative',
              '&:after': {
                content: '""',
                display: 'block',
                position: 'absolute',
                left: 0,
                bottom: -8,
                width: 40,
                height: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2,
              }
            }}
          >
            User Feedback
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            See what our community is saying
          </Typography>
        </Box>
        
        <Button
          component={RouterLink}
          to="/feedback"
          variant="outlined"
          endIcon={<ArrowForward />}
          sx={{ 
            mt: { xs: 2, sm: 0 },
            textTransform: 'none',
            borderRadius: 6,
            px: 2,
            py: 1,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
          }}
        >
          View All Feedback
        </Button>
      </Box>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 2,
          px: { xs: 2, sm: 4, md: 6 },
          overflowX: { xs: 'auto', md: 'visible' }
        }}
      >
        {feedbacks.map((feedback) => (
          <Card 
            key={feedback._id} 
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 2,
              minWidth: { xs: 260, sm: 'auto' },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ flex: 1, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar 
                  src={feedback.author?.profilePic} 
                  sx={{ width: 36, height: 36, mr: 1.5 }}
                >
                  {feedback.author?.firstName?.[0] || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {feedback.author?.firstName} {feedback.author?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(feedback.createdAt)}
                  </Typography>
                </Box>
                <Chip 
                  label={getCategoryLabel(feedback.category)} 
                  size="small" 
                  sx={{ 
                    fontSize: '0.65rem',
                    height: 20,
                    backgroundColor: getCategoryColor(feedback.category),
                    color: 'white'
                  }} 
                />
              </Box>
              
              <Rating 
                value={feedback.rating || 5} 
                readOnly 
                size="small" 
                sx={{ mb: 1.5 }}
              />
              
              <Divider sx={{ mb: 1.5 }} />
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1,
                  lineHeight: 1.6,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {truncateContent(feedback.content)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default RecentFeedback;