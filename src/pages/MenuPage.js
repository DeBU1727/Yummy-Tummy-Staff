import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Paper,
  Divider,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Fade,
  Zoom
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const api = axios.create({ baseURL: `${process.env.REACT_APP_API_BASE_URL}/api` });

// Vibrant Theme Colors
const COLORS = {
  primary: '#eb4d4b',    // Appetizing Red
  secondary: '#f0932b',  // Golden Orange
  background: '#fffaf0', // Warm Cream
  textDark: '#2d3436',
  cardBg: '#ffffff'
};

const MenuPage = () => {
  const { showNotification } = useNotification();
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    api.get('/menu')
      .then(res => setMenu(res.data))
      .catch(err => showNotification('Failed to load menu', 'error'));
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      showNotification(`${item.name} added to cart`, 'success');
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    showNotification('Item removed', 'info');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      showNotification('Enter a name for the order', 'warning');
      return;
    }
    if (orderType === 'DELIVERY' && (!address || !phone)) {
      showNotification('Address and Phone are required', 'warning');
      return;
    }

    const orderData = {
      orderType,
      customerName: customerName.trim(),
      deliveryAddress: address,
      contactNumber: phone,
      paymentMethod: 'CASH',
      items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity }))
    };

    try {
      await api.post('/staff/orders/place', orderData);
      showNotification('Order Placed Successfully!', 'success');
      setCart([]);
      setCustomerName('');
      setAddress('');
      setPhone('');
    } catch (err) {
      showNotification('Failed to place order', 'error');
    }
  };

  return (
    <Box sx={{ backgroundColor: COLORS.background, minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        
        {/* Menu Section */}
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ backgroundColor: COLORS.primary, p: 1.5, borderRadius: 3, display: 'flex', boxShadow: '0 4px 10px rgba(235, 77, 75, 0.3)' }}>
              <RestaurantMenuIcon sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textDark }}>
              Delicious <span style={{ color: COLORS.primary }}>Menu</span>
            </Typography>
          </Box>

          {Object.entries(menu).map(([category, items]) => (
            <Box key={category} sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <div style={{ width: 6, height: 24, background: COLORS.secondary, borderRadius: 3 }} />
                {category}
              </Typography>
              
              <Grid container spacing={3}>
                {items.map(item => (
                  <Grid item key={item.id} xs={12} sm={6} lg={4}>
                    <Zoom in={true}>
                      <Card sx={{ 
                        borderRadius: 6, 
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.02)',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }
                      }}>
                        <CardMedia 
                          component="img" 
                          sx={{ height: 160 }} 
                          image={item.image?.startsWith('http') ? item.image : (item.image?.startsWith('/uploads') ? `${process.env.REACT_APP_API_BASE_URL}${item.image}` : (item.image || 'https://via.placeholder.com/300x160?text=Food+Item'))} 
                        />
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.textDark, mb: 1 }}>
                            {item.name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary }}>
                              ₹{item.price}
                            </Typography>
                            <IconButton 
                              onClick={() => addToCart(item)}
                              sx={{ 
                                backgroundColor: COLORS.secondary, 
                                color: '#fff', 
                                '&:hover': { backgroundColor: '#e67e22' },
                                boxShadow: '0 4px 10px rgba(240, 147, 43, 0.4)'
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Grid>

        {/* Cart/Checkout Sidebar */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper elevation={0} sx={{ 
            p: 3.5, borderRadius: 9, position: 'sticky', top: 30,
            backgroundColor: COLORS.cardBg, border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ShoppingBagOutlinedIcon sx={{ color: COLORS.primary }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.textDark }}>
                My <span style={{ color: COLORS.primary }}>Cart</span>
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={orderType}
              exclusive
              onChange={(e, val) => val && setOrderType(val)}
              fullWidth
              sx={{ 
                mb: 3, p: 0.6, backgroundColor: '#f5f5f5', borderRadius: 4, 
                '& .MuiToggleButton-root': { border: 'none', borderRadius: 3.5, py: 1, fontWeight: 800, textTransform: 'none' } 
              }}
            >
              <ToggleButton value="DINE_IN" sx={{ '&.Mui-selected': { backgroundColor: COLORS.secondary, color: '#fff', '&:hover': { backgroundColor: COLORS.secondary } } }}>
                Dine-In
              </ToggleButton>
              <ToggleButton value="DELIVERY" sx={{ '&.Mui-selected': { backgroundColor: COLORS.secondary, color: '#fff', '&:hover': { backgroundColor: COLORS.secondary } } }}>
                Delivery
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ mb: 3 }}>
              <TextField 
                placeholder="Customer Name" fullWidth variant="filled"
                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><PersonOutlineIcon /></InputAdornment> }}
                sx={{ mb: 2, '& .MuiFilledInput-root': { borderRadius: 4, backgroundColor: '#f9f9f9' } }}
                value={customerName} onChange={e => setCustomerName(e.target.value)}
              />
              {orderType === 'DELIVERY' && (
                <Fade in={true}>
                  <Box>
                    <TextField 
                      placeholder="Delivery Address" fullWidth variant="filled" multiline rows={2}
                      InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><RoomOutlinedIcon /></InputAdornment> }}
                      sx={{ mb: 2, '& .MuiFilledInput-root': { borderRadius: 4, backgroundColor: '#f9f9f9' } }}
                      value={address} onChange={e => setAddress(e.target.value)}
                    />
                    <TextField 
                      placeholder="Contact Number" fullWidth variant="filled"
                      InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><LocalPhoneOutlinedIcon /></InputAdornment> }}
                      sx={{ '& .MuiFilledInput-root': { borderRadius: 4, backgroundColor: '#f9f9f9' } }}
                      value={phone} onChange={e => setPhone(e.target.value)}
                    />
                  </Box>
                </Fade>
              )}
            </Box>

            <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

            <Box sx={{ maxHeight: '35vh', overflowY: 'auto', mb: 3, pr: 1 }}>
              {cart.length === 0 ? (
                <Typography align="center" color="text.secondary" sx={{ py: 4, fontStyle: 'italic' }}>
                  Hungry? Add some items!
                </Typography>
              ) : (
                cart.map(item => (
                  <Box key={item.id} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>{item.name}</Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>₹{item.price}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: '#fcfcfc', borderRadius: 3, p: 0.5, border: '1px solid #eee' }}>
                      <IconButton size="small" onClick={() => updateQty(item.id, -1)} sx={{ color: COLORS.primary }}><RemoveIcon fontSize="small" /></IconButton>
                      <Typography sx={{ fontWeight: 900, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQty(item.id, 1)} sx={{ color: COLORS.secondary }}><AddIcon fontSize="small" /></IconButton>
                      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                      <IconButton size="small" onClick={() => removeItem(item.id)} sx={{ color: '#d1d1d1' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            <Box sx={{ p: 3, backgroundColor: '#fffbf2', borderRadius: 7, border: '1px dashed #f0932b55' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">GST (18%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{gst.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Grand Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary }}>₹{total.toFixed(2)}</Typography>
              </Box>

              <Button 
                variant="contained" fullWidth size="large" onClick={handlePlaceOrder} 
                disabled={cart.length === 0}
                sx={{ 
                  py: 2, borderRadius: 5, fontWeight: 900, textTransform: 'none', fontSize: '1.1rem',
                  backgroundColor: COLORS.primary, boxShadow: '0 10px 25px rgba(235, 77, 75, 0.4)',
                  '&:hover': { backgroundColor: '#d44646', boxShadow: 'none' }
                }}
              >
                Place Order (CASH)
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MenuPage;