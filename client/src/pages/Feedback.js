import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Tooltip,
  Rating,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Send, Feedback as FeedbackIcon, ThumbUp } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Categories for feedback
  const categories = [
    { value: 'general', label: 'General', color: '#9c27b0' },
    { value: 'ui', label: 'User Interface', color: '#2196f3' },
    { value: 'feature', label: 'Feature Request', color: '#4caf50' },
    { value: 'bug', label: 'Bug Report', color: '#f44336' },
    { value: 'performance', label: 'Performance', color: '#ff9800' }
  ];

  useEffect(() => {
    // Configure axios with auth token
    const authToken = localStorage.getItem('token');
    if (authToken) {
      axios.defaults.headers.common['x-auth-token'] = authToken;
    }
    console.log("Feedback component mounted, will fetch data...");
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching feedbacks...');
      const response = await axios.get('/api/feedback');
      console.log('Received feedbacks:', response.data);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      if (error.response?.status === 401) {
        setError('Please login to view feedback');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch feedback. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit feedback');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/feedback', { 
        content: newFeedback,
        rating,
        category
      });
      
      // Add the new feedback to the list
      setFeedbacks([response.data, ...feedbacks]);
      setNewFeedback('');
      setRating(5);
      setCategory('general');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response?.status === 401) {
        setError('Please login to submit feedback');
      } else {
        setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
      }
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

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3 }, 
            bgcolor: '#ffebee',
            color: '#c62828',
            borderRadius: 1
          }}
        >
          <Typography variant={isMobile ? "body2" : "body1"}>{error}</Typography>
        </Paper>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          mb: { xs: 3, sm: 4 }, 
          borderRadius: { xs: 1.5, sm: 2 },
          backgroundImage: 'linear-gradient(to right, #f5f7fa, #e8effc)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 2 
        }}>
          <Box sx={{ mb: isMobile ? 1.5 : 0 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="500" 
              gutterBottom
            >
              Share Your Experience
            </Typography>
            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              color="textSecondary"
            >
              We value your feedback! Help us improve our service
            </Typography>
          </Box>
          {loading && <CircularProgress size={isMobile ? 20 : 24} />}
        </Box>
        
        <form onSubmit={handleFeedbackSubmit}>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            variant="outlined"
            placeholder="Tell us about your experience..."
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: isMobile ? '0.875rem' : 'inherit',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 1.5, sm: 2 }, 
            mb: 2 
          }}>
            <Box sx={{ 
              minWidth: { xs: '100%', sm: 120 }, 
              flex: 1 
            }}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: 'rgba(255,255,255,0.5)',
              p: { xs: 1, sm: 1.5 },
              borderRadius: 1,
              flex: 1,
              justifyContent: { xs: 'space-between', sm: 'flex-start' }
            }}>
              <Typography 
                component="legend" 
                variant={isMobile ? "body2" : "body1"}
              >
                Rating:
              </Typography>
              <Rating
                name="simple-controlled"
                value={rating}
                size={isMobile ? "small" : "medium"}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={!user ? "Please login to submit feedback" : ""}>
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!newFeedback.trim() || !user || loading}
                  fullWidth={isMobile}
                  sx={{ 
                    borderRadius: { xs: 4, sm: 6 },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.8, sm: 1 },
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                    backgroundImage: 'linear-gradient(135deg, #0066CC, #338FFF)',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                  }}
                  startIcon={<FeedbackIcon />}
                >
                  Submit Feedback
                </Button>
              </Box>
            </Tooltip>
          </Box>
        </form>
      </Paper>

      {loading && !feedbacks.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={isMobile ? 30 : 40} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ mb: { xs: 0.5, sm: 1 } }}
          >
            Community Feedback
          </Typography>
          
          {feedbacks.length === 0 && !loading ? (
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              bgcolor: '#f5f5f5', 
              borderRadius: { xs: 1.5, sm: 2 }, 
              textAlign: 'center' 
            }}>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="textSecondary"
              >
                No feedback submitted yet. Be the first to share your thoughts!
              </Typography>
            </Paper>
          ) : (
            feedbacks.map((feedback) => (
              <Card 
                key={feedback._id} 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-3px)' }
                  },
                  borderRadius: { xs: 1.5, sm: 2 }
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'flex-start', 
                    mb: 2 
                  }}>
                    <Avatar 
                      src={feedback.author?.profilePic} 
                      sx={{ 
                        mr: isMobile ? 0 : 2, 
                        mb: isMobile ? 1 : 0,
                        width: isMobile ? 32 : 40,
                        height: isMobile ? 32 : 40
                      }}
                    >
                      {feedback.author?.firstName?.[0] || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between', 
                        alignItems: isMobile ? 'flex-start' : 'center',
                        mb: isMobile ? 0.5 : 0
                      }}>
                        <Typography 
                          variant={isMobile ? "body2" : "subtitle1"}
                          sx={{ fontWeight: isMobile ? 500 : 400 }}
                        >
                          {feedback.author?.firstName} {feedback.author?.lastName || 'Unknown User'}
                        </Typography>
                        <Chip 
                          label={getCategoryLabel(feedback.category)} 
                          size="small" 
                          sx={{ 
                            bgcolor: getCategoryColor(feedback.category),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: isMobile ? 20 : 24,
                            mt: isMobile ? 0.5 : 0
                          }} 
                        />
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center', 
                        mt: isMobile ? 0.5 : 0.5, 
                        mb: 1 
                      }}>
                        <Rating 
                          value={feedback.rating || 5} 
                          readOnly 
                          size="small" 
                        />
                        <Typography 
                          variant="caption" 
                          color="textSecondary" 
                          sx={{ 
                            ml: isMobile ? 0 : 1,
                            mt: isMobile ? 0.5 : 0
                          }}
                        >
                          {formatDate(feedback.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography 
                        variant={isMobile ? "body2" : "body1"} 
                        sx={{ mt: 1 }}
                      >
                        {feedback.content}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Container>
  );
};

export default Feedback; 