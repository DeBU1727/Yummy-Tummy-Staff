import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Container,
  Fade,
  Stack,
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { printOrderBill } from '../utils/printOrder';

const api = axios.create({ baseURL: `${process.env.REACT_APP_API_BASE_URL}/api/staff` });

// Theme Colors from Reference
const COLORS = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  background: '#fffaf0', // Warm Cream
  textDark: '#2d3436',
  surface: '#ffffff'
};

const SearchOrderPage = () => {
  const { showNotification } = useNotification();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError('Order not found. Please check the ID and try again.');
      showNotification('Order not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await api.put(`/orders/${order.id}/status`, `"${newStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      setOrder(response.data);
      showNotification(`Order status updated to ${newStatus}`, 'success');
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const getNextStatus = () => {
    const current = order.orderStatus;
    const type = order.orderType;

    if (type === 'DINE_IN') {
      if (current === 'PENDING') return 'ACCEPTED';
      if (current === 'ACCEPTED') return 'PROCESSING';
      if (current === 'PROCESSING') return 'SERVED';
    } else {
      if (current === 'PENDING') return 'ACCEPTED';
      if (current === 'ACCEPTED') return 'PROCESSING';
      if (current === 'PROCESSING') return 'READY_FOR_DELIVERY';
      if (current === 'READY_FOR_DELIVERY') return 'OUT_FOR_DELIVERY';
      if (current === 'OUT_FOR_DELIVERY') return 'DELIVERED';
    }
    return null;
  };

  return (
    <Box sx={{ backgroundColor: COLORS.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.textDark, mb: 1 }}>
            Find an <span style={{ color: COLORS.primary }}>Order</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter the Unique Order ID to manage status or print receipts.
          </Typography>
        </Box>

        {/* Search Bar Section */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.06)', mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  variant="filled"
                  placeholder="Order ID (e.g. 15)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiFilledInput-root': { borderRadius: 4, backgroundColor: '#f9f9f9' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ 
                    borderRadius: 4, 
                    py: 1.8,
                    fontWeight: 800,
                    backgroundColor: COLORS.primary,
                    boxShadow: '0 8px 15px rgba(235, 77, 75, 0.3)',
                    '&:hover': { backgroundColor: '#d44646' }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {error && <Fade in={true}><Alert severity="error" sx={{ borderRadius: 4, mb: 4 }}>{error}</Alert></Fade>}

        {order && (
          <Fade in={true}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.08)' }}>
              {/* Status Header */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: COLORS.secondary, width: 56, height: 56 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Order #{order.id}</Typography>
                    <Typography variant="body2" color="text.secondary">{new Date(order.createdAt).toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Chip 
                  label={order.orderStatus.replace(/_/g, ' ')} 
                  sx={{ 
                    backgroundColor: COLORS.primary, 
                    color: '#fff', 
                    fontWeight: 800, 
                    height: 40, 
                    px: 2, 
                    borderRadius: 3 
                  }} 
                />
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              <Grid container spacing={4}>
                {/* Details Column */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                        <PersonOutlineIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Customer Info
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{order.customerName}</Typography>
                      <Chip label={order.orderType} size="small" sx={{ mt: 1, fontWeight: 700 }} />
                      {order.orderType === 'DELIVERY' && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2"><b>Address:</b> {order.deliveryAddress}</Typography>
                          <Typography variant="body2"><b>Phone:</b> {order.contactNumber}</Typography>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                        <FastfoodIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Items
                      </Typography>
                      {order.items.map(item => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body1"><b>{item.quantity}x</b> {item.name}</Typography>
                          <Typography variant="body1">₹{(item.price * item.quantity).toFixed(2)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Grid>

                {/* Summary Column */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 6, backgroundColor: '#fff9ef', border: '1px dashed #f0932b55' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Billing</Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Subtotal</Typography>
                        <Typography sx={{ fontWeight: 700 }}>₹{order.subtotal.toFixed(2)}</Typography>
                      </Box>
                      {order.discountAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                          <Typography>Discount ({order.couponCode})</Typography>
                          <Typography>- ₹{order.discountAmount.toFixed(2)}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">GST (18%)</Typography>
                        <Typography sx={{ fontWeight: 700 }}>₹{order.gstAmount.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Total</Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 900 }}>
                          ₹{order.totalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  variant="outlined" 
                  startIcon={<PrintIcon />} 
                  onClick={() => printOrderBill(order)}
                  sx={{ borderRadius: 4, px: 4, borderWeight: 2, fontWeight: 700, borderColor: COLORS.textDark, color: COLORS.textDark }}
                >
                  Print Receipt
                </Button>
                
                {getNextStatus() && (
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => updateStatus(getNextStatus())}
                    sx={{ borderRadius: 4, px: 4, fontWeight: 800, boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)' }}
                  >
                    Mark as {getNextStatus().replace(/_/g, ' ')}
                  </Button>
                )}

                {order.orderStatus === 'PENDING' && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => updateStatus('REJECTED')}
                    sx={{ borderRadius: 4, px: 4, fontWeight: 700 }}
                  >
                    Reject Order
                  </Button>
                )}
              </Stack>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default SearchOrderPage;