import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  Divider,
  Box,
  CircularProgress,
  Alert,
  Badge,
  Chip,
} from '@mui/material';
import { Chat as ChatIcon, ImageNotSupported, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';  // Import the API utility with authentication

const ChatInbox = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Use the api utility instead of axios directly
        const response = await api.get('/api/chats');
        setChats(response.data);
        
        // Calculate total unread messages
        const unreadCount = response.data.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
        setTotalUnread(unreadCount);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err.response?.data?.message || 'Error fetching chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get the item image URL
  const getItemImageUrl = (item) => {
    if (!item || !item.photos || item.photos.length === 0) {
      return null;
    }
    
    const photo = item.photos[0];
    if (photo.startsWith('http')) {
      return photo;
    } else {
      return `/${photo}`;
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">
              My Chats
            </Typography>
            {totalUnread > 0 && (
              <Chip 
                icon={<NotificationsIcon fontSize="small" />}
                label={`${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'medium' }}
              />
            )}
          </Box>
          
          {chats.length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              No chats yet. Start a conversation by viewing an item and clicking "Chat with Seller"!
            </Typography>
          ) : (
            <List>
              {chats.map((chat, index) => {
                const otherParticipant = chat.participants.find(p => p._id !== user?.id);
                const lastMessage = chat.messages[chat.messages.length - 1];
                const itemImageUrl = getItemImageUrl(chat.item);
                const hasUnread = chat.unreadCount > 0;
                
                return (
                  <React.Fragment key={chat._id}>
                    {index > 0 && <Divider />}
                    <ListItem 
                      button 
                      component={Link} 
                      to={`/chat/${chat._id}`}
                      sx={{ 
                        position: 'relative',
                        backgroundColor: hasUnread ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                        '&:hover': { 
                          backgroundColor: hasUnread ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        {hasUnread ? (
                          <Badge 
                            color="primary" 
                            badgeContent={chat.unreadCount}
                            overlap="circular"
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                          >
                            <Avatar 
                              src={itemImageUrl}
                              variant="rounded"
                              sx={{ 
                                width: 50, 
                                height: 50,
                                bgcolor: itemImageUrl ? 'transparent' : '#f5f5f5'
                              }}
                            >
                              {!itemImageUrl && <ImageNotSupported />}
                            </Avatar>
                          </Badge>
                        ) : (
                          <Avatar 
                            src={itemImageUrl}
                            variant="rounded"
                            sx={{ 
                              width: 50, 
                              height: 50,
                              bgcolor: itemImageUrl ? 'transparent' : '#f5f5f5'
                            }}
                          >
                            {!itemImageUrl && <ImageNotSupported />}
                          </Avatar>
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: hasUnread ? 700 : 500,
                                color: hasUnread ? 'primary.main' : 'inherit'
                              }}
                            >
                              {chat.item?.name || 'Unknown Item'}
                            </Typography>
                            {lastMessage && (
                              <Typography 
                                variant="caption" 
                                color={hasUnread ? "primary" : "textSecondary"}
                                sx={{ fontWeight: hasUnread ? 600 : 400 }}
                              >
                                {new Date(lastMessage.timestamp).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              color={hasUnread ? "primary" : "textSecondary"}
                              sx={{ fontWeight: hasUnread ? 600 : 400 }}
                              noWrap
                            >
                              With: {otherParticipant?.username || 'Unknown User'}
                            </Typography>
                            {lastMessage && (
                              <Typography 
                                variant="body2" 
                                color={hasUnread ? "primary" : "textSecondary"}
                                sx={{ fontWeight: hasUnread ? 600 : 400 }}
                                noWrap
                              >
                                Last message: {lastMessage.content}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatInbox; 