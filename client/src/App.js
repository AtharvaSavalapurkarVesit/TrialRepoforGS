import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material';
import { Box, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import ItemDetail from './pages/ItemDetail';
import Chat from './pages/Chat';
import PrivateRoute from './components/PrivateRoute';
import ChatInbox from './pages/ChatInbox';
import Forum from './pages/Forum';
import Feedback from './pages/Feedback';
import CategoryPage from './pages/CategoryPage';
import buttonStyles from './styles/buttonStyles';
import EditItem from './pages/EditItem';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

let theme = createTheme({
  palette: {
    primary: {
      main: '#0066CC', // Apple-like blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#147CE5', // Lighter blue
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    body1: {
      letterSpacing: '-0.015em',
    },
    body2: {
      letterSpacing: '-0.015em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: {
            xs: '3%',
            sm: '2%',
            md: '24px'
          },
          paddingRight: {
            xs: '3%',
            sm: '2%',
            md: '24px'
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          ...buttonStyles.button,
          '&:hover, &:focus': {
            transform: 'none !important',
          },
          transformOrigin: 'center',
          animationFillMode: 'forwards',
          willChange: 'background-color, color',
          '@media (max-width: 600px)': {
            padding: '8px 16px',
            fontSize: '0.875rem',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#0052a3', // Darker blue on hover
          },
          ...buttonStyles.containedButton,
        },
        disabled: {
          opacity: 0.7,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
    MuiCardMedia: {
      styleOverrides: {
        root: {
          backgroundSize: 'contain'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            '@media (max-width: 600px)': {
              fontSize: '0.875rem',
            },
          },
          '& .MuiInputBase-input': {
            '@media (max-width: 600px)': {
              fontSize: '0.875rem',
            },
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '8px',
            fontSize: '0.75rem',
          },
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            fontSize: '1.1rem',
            padding: '16px',
          },
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '16px',
            fontSize: '0.875rem',
          },
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '8px 16px 16px',
          },
        }
      }
    },
  },
});

// Apply responsive font sizes to all typography variants
theme = responsiveFontSizes(theme, { factor: 0.5 });

// Custom route that redirects to Home if authenticated, otherwise shows Landing
const LandingRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Or a loading spinner
  }
  
  return user ? <Navigate to="/home" /> : <Landing />;
};

// Custom route that redirects to Landing if not authenticated, otherwise shows Home
const HomeRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Or a loading spinner
  }
  
  return user ? <Home /> : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'background.default'
          }}>
            <Navbar />
            <Box sx={{ flex: 1, py: { xs: 2, sm: 3 } }}>
              <Routes>
                <Route path="/" element={<LandingRoute />} />
                <Route path="/home" element={<HomeRoute />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-listing"
                  element={
                    <PrivateRoute>
                      <CreateListing />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-item/:id"
                  element={
                    <PrivateRoute>
                      <EditItem />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/items/:id"
                  element={
                    <PrivateRoute>
                      <ItemDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat/:chatId"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chats"
                  element={
                    <PrivateRoute>
                      <ChatInbox />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/forum"
                  element={
                    <PrivateRoute>
                      <Forum />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <PrivateRoute>
                      <Feedback />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
