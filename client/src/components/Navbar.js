import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Tabs,
  Tab,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Badge,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Chat as ChatIcon, 
  Dashboard, 
  QuestionAnswer, 
  Menu as MenuIcon, 
  PostAdd, 
  Forum as ForumIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  ViewList as WatchlistIcon
} from '@mui/icons-material';

const categories = [
  { name: 'Books', url: 'books' },
  { name: 'Notes', url: 'notes' },
  { name: 'Stationary', url: 'stationary' },
  { name: 'Clothes & Costumes', url: 'clothes-and-costumes' },
  { name: 'Art', url: 'art' },
  { name: 'Sports Accessories', url: 'sports-accessories' },
  { name: 'Devices', url: 'devices' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/api/chats');
        const totalUnread = response.data.reduce(
          (total, chat) => total + (chat.unreadCount || 0), 
          0
        );
        setUnreadMessageCount(totalUnread);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.toLowerCase().replace(/ & /g, '-')}`);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    if (isMobile) setMobileOpen(false);
    navigate('/');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: '100%', maxWidth: '320px' }}>
      <Box sx={{ 
        p: '6%', 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: '#0078D4',
        color: 'white'
      }}>
        <img
          src="/logo.jpg"
          alt="GarageSale Logo"
          style={{
            height: '48px',
            width: 'auto',
            marginRight: '5%',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          GarageSale
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to="/" sx={{ 
          borderRadius: '0 24px 24px 0',
          mx: 1,
          my: 0.5,
          '&:hover': {
            backgroundColor: 'rgba(0, 120, 212, 0.08)'
          }
        }}>
          <ListItemIcon><HomeIcon sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
          <ListItemText primary="Home" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500 }} />
        </ListItem>
        
        {user ? (
          <>
            <ListItem button component={Link} to="/dashboard" sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)'
              }
            }}>
              <ListItemIcon><Dashboard sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500 }} />
            </ListItem>
            <ListItem button component={Link} to="/create-listing" sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)'
              }
            }}>
              <ListItemIcon><PostAdd sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
              <ListItemText primary="Create Listing" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500 }} />
            </ListItem>
            <ListItem button component={Link} to="/chats" sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)'
              }
            }}>
              <ListItemIcon>
                {unreadMessageCount > 0 ? (
                  <Badge color="error" badgeContent={unreadMessageCount}>
                    <ChatIcon sx={{ fontSize: 24, color: '#0078D4' }} />
                  </Badge>
                ) : (
                  <ChatIcon sx={{ fontSize: 24, color: '#0078D4' }} />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography fontSize="1.1rem" fontWeight={500}>Messages</Typography>
                    {unreadMessageCount > 0 && (
                      <Chip
                        size="small"
                        label={unreadMessageCount}
                        color="error"
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                } 
              />
            </ListItem>
            <ListItem button component={Link} to="/forum" sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)'
              }
            }}>
              <ListItemIcon><ForumIcon sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
              <ListItemText primary="Forum" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500 }} />
            </ListItem>
            <Divider sx={{ my: 1.5 }} />
            <ListItem button onClick={handleLogout} sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)'
              }
            }}>
              <ListItemIcon><LogoutIcon sx={{ fontSize: 24, color: '#d32f2f' }} /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500, color: '#d32f2f' }} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)'
              }
            }}>
              <ListItemIcon><LoginIcon sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
              <ListItemText primary="Login" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500 }} />
            </ListItem>
            <ListItem button component={Link} to="/register" sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5,
              backgroundColor: 'rgba(0, 120, 212, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.15)'
              }
            }}>
              <ListItemIcon><RegisterIcon sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
              <ListItemText primary="Register" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 600, color: '#0078D4' }} />
            </ListItem>
          </>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        <ListItem sx={{ px: 3 }}>
          <ListItemIcon><CategoryIcon sx={{ fontSize: 24, color: '#0078D4' }} /></ListItemIcon>
          <ListItemText primary="Categories" primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 700, color: '#424242' }} />
        </ListItem>
        {categories.map((category) => (
          <ListItem 
            button 
            key={category.url} 
            onClick={() => handleCategoryClick(category.url)}
            sx={{ 
              pl: 4,
              borderRadius: '0 24px 24px 0',
              mx: 1,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)'
              }
            }}
          >
            <ListItemText primary={category.name} primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500, color: '#666' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ 
        backgroundColor: '#0078D4', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: '3%', sm: '2%', md: 3 } }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: '70px' } }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <img
                src="/logo.jpg"
                alt="GarageSale Logo"
                style={{
                  height: '52px',
                  width: 'auto',
                  marginRight: '12px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: '1.35rem', sm: '1.5rem' },
                  letterSpacing: '0.5px'
                }}
              >
                GarageSale
              </Typography>
            </Box>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ 
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {user ? (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/create-listing"
                      sx={{ 
                        mx: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        py: 0.8,
                        px: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)'
                        }
                      }}
                    >
                      Create Listing
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/forum"
                      sx={{ 
                        mx: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        py: 0.8,
                        px: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)'
                        }
                      }}
                    >
                      Forum
                    </Button>
                    <IconButton
                      component={Link}
                      to="/chats"
                      color="inherit"
                      sx={{ 
                        mx: 1.5,
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)'
                        }
                      }}
                    >
                      <Badge color="secondary" badgeContent={unreadMessageCount}>
                        <ChatIcon sx={{ fontSize: 24 }} />
                      </Badge>
                    </IconButton>
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                      sx={{ 
                        ml: 1.5,
                        padding: '6px',
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          border: '2px solid rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    >
                      <Avatar 
                        src={user.profilePic} 
                        alt={user.firstName}
                        sx={{ width: 38, height: 38 }}
                      >
                        {user.firstName?.[0]}
                      </Avatar>
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        elevation: 4,
                        sx: {
                          mt: 1.5,
                          minWidth: 220,
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <MenuItem component={Link} to="/dashboard" onClick={handleClose} sx={{ fontSize: '1rem', py: 1.2 }}>
                        Dashboard
                      </MenuItem>
                      <MenuItem component={Link} to="/profile" onClick={handleClose} sx={{ fontSize: '1rem', py: 1.2 }}>
                        Profile
                      </MenuItem>
                      <MenuItem component={Link} to="/forum" onClick={handleClose} sx={{ fontSize: '1rem', py: 1.2 }}>
                        Forum
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ fontSize: '1rem', py: 1.2, color: '#d32f2f' }}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/login"
                      sx={{ 
                        mx: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        py: 0.8,
                        px: 2.5,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)'
                        }
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      sx={{ 
                        ml: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        py: 0.8,
                        px: 2.5,
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#0078D4',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Category Bar with updated styling */}
      <Box sx={{ 
        backgroundColor: '#f8f9fa', 
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 0, sm: 1, md: 2 },
            width: '100%'
          }}
        >
          <Tabs
            value={false}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: '46px', sm: '52px' },
              '& .MuiTab-root': { 
                minHeight: { xs: '46px', sm: '52px' },
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 600,
                py: { xs: 0.5, sm: 1.2 },
                px: { xs: '3%', sm: '20px' },
                minWidth: 'auto',
                transition: 'all 0.2s ease',
                color: '#424242',
                '&:hover': {
                  color: '#0078D4',
                  backgroundColor: 'rgba(0, 120, 212, 0.08)'
                }
              },
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
              },
              '& .MuiTabScrollButton-root': {
                opacity: 0.8,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.url}
                label={category.name}
                onClick={() => handleCategoryClick(category.url)}
              />
            ))}
          </Tabs>
        </Container>
      </Box>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: '85%', sm: '320px' },
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar; 