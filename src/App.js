import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar, Stack } from '@mui/material';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import SearchOrderPage from './pages/SearchOrderPage';
import { NotificationProvider } from './context/NotificationContext';
import RestaurantIcon from '@mui/icons-material/Restaurant';

// Design constants from the "Foody" reference
const COLORS = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  background: '#fffaf0', // Warm Cream
  textDark: '#2d3436',
};

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Live Orders', path: '/' },
    { label: 'Search', path: '/search' },
    { label: 'Place Order', path: '/menu' },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        px: { md: 4 }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo Section */}
        <Stack direction="row" spacing={1} alignItems="center" component={Link} to="/" sx={{ textDecoration: 'none' }}>
          <Avatar sx={{ bgcolor: COLORS.primary, width: 35, height: 35, boxShadow: '0 4px 10px rgba(235, 77, 75, 0.3)' }}>
            <RestaurantIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 900, 
              color: COLORS.primary, 
              letterSpacing: '-0.5px',
              fontFamily: "'Poppins', sans-serif" 
            }}
          >
            Yummy-Tummy <span style={{ color: COLORS.textDark, fontSize: '0.8rem', fontWeight: 600 }}>STAFF</span>
          </Typography>
        </Stack>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  px: 2,
                  borderRadius: 3,
                  color: isActive ? COLORS.primary : COLORS.textDark,
                  backgroundColor: isActive ? 'rgba(235, 77, 75, 0.08)' : 'transparent',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(235, 77, 75, 0.05)',
                    color: COLORS.primary
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Staff Profile Placeholder (Optional Visual Polish) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Avatar sx={{ bgcolor: COLORS.secondary, cursor: 'pointer', width: 35, height: 35 }}>S</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Box sx={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
          <Navigation />
          <Container 
            maxWidth="xl" 
            sx={{ 
              mt: { xs: 2, md: 5 }, 
              pb: 5,
              // Smooth page transitions effect
              animation: 'fadeIn 0.5s ease-in-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Routes>
              <Route path="/" element={<OrdersPage />} />
              <Route path="/search" element={<SearchOrderPage />} />
              <Route path="/menu" element={<MenuPage />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </NotificationProvider>
  );
}

export default App;