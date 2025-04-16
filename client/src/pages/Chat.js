import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  Check,
  CheckCircle,
  Store,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EmojiPicker from 'emoji-picker-react';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchChat = useCallback(async () => {
    try {
      const response = await api.get(`/api/chats/${chatId}`);
      setChat(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chat:', err);
      setError(err.response?.data?.message || 'Error fetching chat');
      if (err.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [chatId, navigate]);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [fetchChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await api.post(`/api/chats/${chatId}/messages`, { content: message });
      setMessage('');
      await fetchChat();
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Error sending message');
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojis(false);
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  if (!chat) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Chat not found</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  const seller = chat?.item?.seller ? chat.participants.find(p => p._id === chat.item.seller) : null;
  const otherParticipant = chat?.participants?.find(p => p._id !== user?.id);
  const isSeller = user?.id === chat?.item?.seller;

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#f8f9fa',
          borderRadius: 0
        }}
      >
        {/* Chat Header */}
        <Box 
          sx={{ 
            p: 1.5, 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: '#1976d2',
            color: 'white'
          }}
        >
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Avatar 
                src={otherParticipant?.profilePic}
                sx={{ width: 40, height: 40 }}
              >
                {otherParticipant?.username?.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {chat?.item?.name || 'Chat'}
                  {chat?.item?.price && (
                    <Typography component="span" variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      • ₹{chat.item.price}
                    </Typography>
                  )}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  Chatting with: {otherParticipant?.username || 'Unknown User'}
                  {isSeller ? null : (
                    <Badge
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: '#fff',
                          color: '#1976d2',
                          fontSize: '0.7rem',
                          height: '16px',
                          minWidth: '45px',
                          fontWeight: 'bold',
                          ml: 1
                        },
                      }}
                      badgeContent="SELLER"
                    />
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Messages */}
        <Box sx={{ 
          p: 2, 
          flexGrow: 1, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: '#f8f9fa',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23e3f2fd' stroke-width='1'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundAttachment: 'fixed'
        }}>
          {chat.messages && chat.messages.length > 0 ? (
            chat.messages.map((msg, index) => {
              const isCurrentUser = msg.sender === user?.id;
              const isSenderSeller = msg.sender === chat?.item?.seller;
              const messageUser = chat.participants.find(p => p._id === msg.sender);
              
              return (
                <Box
                  key={msg._id || index}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mb: 1.5
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Sender name */}
                    <Typography
                      variant="caption"
                      sx={{
                        mb: 0.5,
                        px: 1,
                        color: isCurrentUser ? '#1976d2' : '#666',
                        fontWeight: 500
                      }}
                    >
                      {messageUser?.username || (isSenderSeller ? 'Seller' : 'User')}
                    </Typography>

                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: isCurrentUser ? '#1976d2' : 'white',
                        color: isCurrentUser ? 'white' : 'inherit',
                        borderRadius: '12px',
                        position: 'relative',
                        minWidth: '100px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 0.5,
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.content}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end',
                        gap: 0.5,
                        mt: 0.5
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                            fontSize: '0.7rem'
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              align="center"
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                p: 2,
                borderRadius: 1
              }}
            >
              No messages yet. Start the conversation!
            </Typography>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box sx={{ 
          p: 1.5, 
          bgcolor: '#f8f9fa',
          borderTop: 1,
          borderColor: 'divider'
        }}>
          {showEmojis && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: '80px', 
              right: '24px',
              zIndex: 1
            }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Box>
          )}
          <form onSubmit={handleSendMessage}>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    // Handle file upload
                    console.log(e.target.files);
                  }}
                />
                <IconButton 
                  onClick={handleAttachFile}
                  sx={{ color: '#666' }}
                >
                  <AttachFile />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton 
                  onClick={() => setShowEmojis(!showEmojis)}
                  sx={{ color: '#666' }}
                >
                  <EmojiEmotions />
                </IconButton>
              </Grid>
              <Grid item xs>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      bgcolor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item>
                <IconButton
                  type="submit"
                  disabled={!message.trim()}
                  sx={{
                    bgcolor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#1565c0'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#9e9e9e'
                    }
                  }}
                >
                  <Send />
                </IconButton>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat; 