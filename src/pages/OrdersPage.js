import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, CircularProgress, IconButton, 
  Container, Avatar, Tooltip, Fade, Stack 
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { printOrderBill } from '../utils/printOrder';

const api = axios.create({ baseURL: `${process.env.REACT_APP_API_BASE_URL}/api/staff` });

// Matching the "Foody" UI Palette
const COLORS = {
  primary: '#eb4d4b',    // Coral Red
  secondary: '#f0932b',  // Golden Orange
  background: '#fffaf0', // Warm Cream
  textDark: '#2d3436',
  surface: '#ffffff'
};

const OrdersPage = () => {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, `"${newStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      showNotification(`Order #${id} updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data || 'Failed to update status';
      showNotification(errorMsg, 'error');
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}/payment-status`, `"${newStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      showNotification(`Payment for #${id} confirmed`, 'success');
      fetchOrders();
    } catch (err) {
      showNotification('Failed to update payment', 'error');
    }
  };

  const getNextStatus = (order) => {
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff4e5', text: '#b45309' };
      case 'ACCEPTED': return { bg: '#e0f2fe', text: '#0369a1' };
      case 'PROCESSING': return { bg: '#fef3c7', text: '#92400e' };
      case 'SERVED':
      case 'DELIVERED': return { bg: '#dcfce7', text: '#15803d' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <CircularProgress sx={{ color: COLORS.primary }} />
      <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>Syncing Live Orders...</Typography>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: COLORS.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: COLORS.primary, width: 56, height: 56, boxShadow: 3 }}>
              <ReceiptLongIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textDark }}>
                Live <span style={{ color: COLORS.primary }}>Orders</span>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor and manage incoming food requests in real-time.
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={<PendingActionsIcon style={{ color: COLORS.secondary }} />}
            label={`${orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'SERVED').length} Active Orders`}
            sx={{ fontWeight: 700, px: 1, backgroundColor: '#fff', border: '1px solid #ddd' }}
          />
        </Box>

        {/* Orders Table */}
        <Fade in={true} timeout={800}>
          <TableContainer component={Paper} sx={{ 
            borderRadius: 6, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead sx={{ bgcolor: '#fdfdfd' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ORDER ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>CUSTOMER</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ITEMS</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>PAYMENT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>STATUS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: COLORS.surface }}>
                {orders.map((order) => {
                  const next = getNextStatus(order);
                  const isDeliveredAction = next === 'DELIVERED';
                  const isPaymentPending = order.paymentStatus === 'PENDING';
                  const style = getStatusStyle(order.orderStatus);

                  return (
                    <TableRow key={order.id} hover sx={{ transition: '0.2s', '&:hover': { bgcolor: '#fffbf2' } }}>
                      <TableCell sx={{ fontWeight: 900, color: COLORS.primary }}>
                        #{order.id}
                      </TableCell>
                      
                      <TableCell>
                        <Typography sx={{ fontWeight: 800, color: COLORS.textDark }}>
                          {order.customerName || 'Walk-in Guest'}
                        </Typography>
                        <Chip 
                          label={order.orderType} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.65rem', 
                            height: 20, 
                            fontWeight: 700, 
                            bgcolor: order.orderType === 'DINE_IN' ? '#fef3c7' : '#e0f2fe',
                            color: order.orderType === 'DINE_IN' ? '#92400e' : '#0369a1',
                            mt: 0.5
                          }} 
                        />
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          {order.items.map(item => (
                            <Typography key={item.id} variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <b style={{ color: COLORS.secondary }}>{item.quantity}x</b> {item.name}
                            </Typography>
                          ))}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.paymentMethod}</Typography>
                        <Chip 
                          label={order.paymentStatus} 
                          size="small" 
                          variant={order.paymentStatus === 'COMPLETED' ? 'filled' : 'outlined'}
                          color={order.paymentStatus === 'COMPLETED' ? 'success' : 'warning'} 
                          sx={{ mt: 0.5, fontWeight: 700, height: 22 }}
                        />
                        {isPaymentPending && (
                          <Button 
                            variant="text"
                            size="small" 
                            startIcon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} 
                            onClick={() => updatePaymentStatus(order.id, 'COMPLETED')}
                            sx={{ mt: 0.5, display: 'flex', textTransform: 'none', fontWeight: 800, p: 0 }}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip 
                          label={order.orderStatus.replace(/_/g, ' ')} 
                          sx={{ 
                            fontWeight: 800, 
                            bgcolor: style.bg, 
                            color: style.text,
                            borderRadius: 2
                          }} 
                          size="small" 
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Print Receipt">
                            <IconButton 
                              onClick={() => printOrderBill(order)}
                              sx={{ border: '1px solid #eee', color: COLORS.textDark, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {next ? (
                            <Button 
                              variant="contained" 
                              size="small" 
                              disableElevation
                              onClick={() => updateStatus(order.id, next)}
                              disabled={isDeliveredAction && isPaymentPending}
                              sx={{ 
                                textTransform: 'none', 
                                fontWeight: 800, 
                                borderRadius: 3,
                                bgcolor: COLORS.secondary,
                                '&:hover': { bgcolor: '#e67e22' }
                              }}
                            >
                              Mark as {next.replace(/_/g, ' ')}
                            </Button>
                          ) : (
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
                              ✓ COMPLETED
                            </Typography>
                          )}
                          
                          {order.orderStatus === 'PENDING' && (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              color="error"
                              onClick={() => updateStatus(order.id, 'REJECTED')}
                              sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none' }}
                            >
                              Reject
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      </Container>
    </Box>
  );
};

export default OrdersPage;