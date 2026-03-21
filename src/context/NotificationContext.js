import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, Slide, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Transition component for a smoother "Foody" feel
function TransitionLeft(props) {
  return <Slide {...props} direction="up" />;
}

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  });

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Custom colors matching the reference UI
  const severityColors = {
    success: { bg: '#ebfbee', text: '#15803d', icon: '#22c55e', border: '#bbf7d0' },
    error: { bg: '#fff5f5', text: '#c53030', icon: '#eb4d4b', border: '#fed7d7' },
    warning: { bg: '#fffaf0', text: '#9a3412', icon: '#f0932b', border: '#ffedd5' },
    info: { bg: '#f0f9ff', text: '#0369a1', icon: '#0ea5e9', border: '#e0f2fe' },
  };

  const currentStyle = severityColors[notification.severity] || severityColors.info;

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={TransitionLeft}
        sx={{ mb: 2 }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          iconMapping={{
            success: <CheckCircleOutlineIcon sx={{ color: currentStyle.icon }} />,
            error: <ErrorOutlineIcon sx={{ color: currentStyle.icon }} />,
            warning: <WarningAmberOutlinedIcon sx={{ color: currentStyle.icon }} />,
            info: <InfoOutlinedIcon sx={{ color: currentStyle.icon }} />,
          }}
          sx={{
            width: '100%',
            minWidth: '300px',
            borderRadius: '20px', // Matches the rounded theme of "Foody"
            backgroundColor: currentStyle.bg,
            color: currentStyle.text,
            fontWeight: 700,
            fontSize: '0.95rem',
            border: `1px solid ${currentStyle.border}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', // Soft elevation
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-message': {
              padding: '8px 0',
            },
            '& .MuiAlert-icon': {
              fontSize: 28,
              opacity: 1,
            },
            '& .MuiIconButton-root': {
              color: currentStyle.text,
            },
          }}
        >
          <Box sx={{ px: 1 }}>
             {notification.message}
          </Box>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};