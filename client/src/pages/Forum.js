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
  CardActions,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ThumbUp, Comment, Send, QuestionAnswer } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Forum = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Configure axios with auth token
    const authToken = localStorage.getItem('token');
    if (authToken) {
      axios.defaults.headers.common['x-auth-token'] = authToken;
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching posts...');
      const response = await axios.get('/api/forum/posts');
      console.log('Received posts:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        setError('Please login to view posts');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch posts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to create a post');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/forum/posts', { content: newPost });
      
      // The server now sends back the complete post object with author information
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        setError('Please login to create a post');
      } else {
        setError(error.response?.data?.message || 'Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/forum/posts/${selectedPost._id}/replies`, {
        content: reply
      });
      const updatedPosts = posts.map(post => 
        post._id === response.data._id ? response.data : post
      );
      setPosts(updatedPosts);
      setReply('');
      setSelectedPost(null);
    } catch (error) {
      console.error('Error replying to post:', error);
      setError(error.response?.data?.message || 'Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      setError(null);
      const response = await axios.post(`/api/forum/posts/${postId}/like`);
      const updatedPosts = posts.map(post => 
        post._id === response.data._id ? response.data : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking post:', error);
      setError(error.response?.data?.message || 'Failed to update like');
    }
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
          borderRadius: { xs: 1.5, sm: 2 }
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
              Ask Forum
            </Typography>
            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              color="textSecondary"
            >
              Ask questions, share knowledge, and connect with other users
            </Typography>
          </Box>
          {loading && <CircularProgress size={isMobile ? 20 : 24} />}
        </Box>
        
        <form onSubmit={handlePostSubmit}>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            variant="outlined"
            placeholder="What's your question?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={!user ? "Please login to post" : ""}>
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!newPost.trim() || !user || loading}
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
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                  }}
                  startIcon={<QuestionAnswer />}
                >
                  Post Question
                </Button>
              </Box>
            </Tooltip>
          </Box>
        </form>
      </Paper>

      {loading && !posts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={isMobile ? 30 : 40} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          {posts.map((post) => (
            <Card 
              key={post._id} 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
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
                    src={post.author?.profilePic} 
                    sx={{ 
                      mr: isMobile ? 0 : 2, 
                      mb: isMobile ? 1 : 0,
                      width: isMobile ? 32 : 40,
                      height: isMobile ? 32 : 40
                    }}
                  >
                    {post.author?.username?.[0] || '?'}
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
                        {post.author?.username || 'Unknown User'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ mt: isMobile ? 0.3 : 0 }}
                      >
                        {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}
                    >
                      {post.content}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mt: { xs: 0.5, sm: 1 }
                    }}>
                      <IconButton 
                        size={isMobile ? "small" : "medium"} 
                        onClick={() => handleLike(post._id)}
                        color={(post.likes && user && post.likes.includes(user.id)) ? 'primary' : 'default'}
                        sx={{ p: isMobile ? 0.5 : 1 }}
                      >
                        <ThumbUp fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                      <Typography variant={isMobile ? "caption" : "body2"}>
                        {post.likes?.length || 0} likes
                      </Typography>
                      <IconButton 
                        size={isMobile ? "small" : "medium"} 
                        onClick={() => setSelectedPost(post)}
                        sx={{ p: isMobile ? 0.5 : 1 }}
                      >
                        <Comment fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                      <Typography variant={isMobile ? "caption" : "body2"}>
                        {post.replies?.length || 0} replies
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {post.replies && post.replies.length > 0 && (
                  <Box sx={{ ml: { xs: 1, sm: 2, md: 3 }, mt: 1 }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      color="textSecondary" 
                      sx={{ mb: 1 }}
                    >
                      Replies:
                    </Typography>
                    {post.replies.map((reply, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: { xs: 1, sm: 1.5 },
                          p: { xs: 1, sm: 1.5 },
                          bgcolor: 'rgba(0,0,0,0.02)',
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 0.5 
                        }}>
                          <Avatar 
                            src={reply.author?.profilePic} 
                            sx={{ 
                              width: isMobile ? 24 : 32, 
                              height: isMobile ? 24 : 32, 
                              mr: 1 
                            }}
                          >
                            {reply.author?.username?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography 
                              variant={isMobile ? "caption" : "body2"} 
                              sx={{ fontWeight: 500 }}
                            >
                              {reply.author?.username || 'Unknown User'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="textSecondary" 
                              sx={{ ml: isMobile ? 0 : 1, display: { xs: 'block', sm: 'inline' } }}
                            >
                              {formatDate(reply.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant={isMobile ? "caption" : "body2"} sx={{ ml: { xs: 0, sm: 4 } }}>
                          {reply.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Reply Dialog */}
      <Dialog 
        open={!!selectedPost} 
        onClose={() => setSelectedPost(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: { xs: 1.5, sm: 2 },
            p: { xs: 0.5, sm: 1 }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: { xs: 1.5, sm: 2 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Reply to Discussion
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 0.5, sm: 1 } }}>
          {selectedPost && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Replying to:
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {selectedPost.content}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            multiline
            rows={3}
            variant="outlined"
            fullWidth
            placeholder="Write your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            size={isMobile ? "small" : "medium"}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: isMobile ? '0.875rem' : 'inherit',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button 
            onClick={() => setSelectedPost(null)} 
            color="inherit"
            size={isMobile ? "small" : "medium"}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReplySubmit} 
            variant="contained" 
            startIcon={<Send />}
            disabled={!reply.trim() || loading}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              textTransform: 'none',
              borderRadius: { xs: 3, sm: 4 }
            }}
          >
            {loading ? 'Posting...' : 'Post Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Forum; 