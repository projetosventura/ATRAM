import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InspectionSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Vistoria Enviada!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sua vistoria foi enviada com sucesso e está aguardando aprovação.
          Você será notificado quando ela for analisada.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => window.close()}
          >
            Fechar Página
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default InspectionSuccessPage; 