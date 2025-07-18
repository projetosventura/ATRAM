import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  IconButton,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api';

const InspectionRequestButton = ({ truck, vehicleSet, driver, onComplete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inspectionUrl, setInspectionUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ((truck || vehicleSet) && driver) {
      handleCreateRequest();
    }
  }, [truck, vehicleSet, driver]);

  const handleCreateRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestData = {
        driver_id: driver.id
      };

      // Se for um conjunto de veículos, usar vehicle_set_id, senão usar truck_id para compatibilidade
      if (vehicleSet) {
        requestData.vehicle_set_id = vehicleSet.id;
      } else if (truck) {
        requestData.truck_id = truck.id;
      }

      const response = await axios.post(`${API_URL}/inspection-requests`, requestData);

      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/inspection/${response.data.request.token}`;
      setInspectionUrl(fullUrl);
      setOpen(true);
    } catch (error) {
      console.error('Error creating inspection request:', error);
      setError('Erro ao criar solicitação de vistoria');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(inspectionUrl);
    setSnackbarOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Link de Vistoria</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Compartilhe este link com o motorista para que ele possa preencher a vistoria:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              value={inspectionUrl}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={handleCopyUrl} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Link copiado para a área de transferência"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default InspectionRequestButton; 