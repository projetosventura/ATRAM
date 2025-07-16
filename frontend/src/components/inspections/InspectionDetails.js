import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close, NavigateBefore, NavigateNext } from '@mui/icons-material';
import axios from 'axios';

const InspectionDetails = ({ inspectionId, onClose }) => {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    fetchInspectionDetails();
  }, [inspectionId]);

  const fetchInspectionDetails = async () => {
    try {
      const response = await axios.get(`/api/inspections/${inspectionId}`);
      setInspection(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da vistoria:', error);
      setError('Erro ao carregar detalhes da vistoria');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setPhotoDialogOpen(true);
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev === inspection.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev === 0 ? inspection.photos.length - 1 : prev - 1
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'good': return 'success';
      case 'regular': return 'warning';
      case 'bad': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) return <Typography>Carregando...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!inspection) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          Detalhes da Vistoria
        </Typography>
        <Chip
          label={inspection.status === 'pending' ? 'Pendente' :
                inspection.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
          color={getStatusColor(inspection.status)}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Data da Vistoria
          </Typography>
          <Typography variant="body1">
            {formatDate(inspection.inspection_date)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Próxima Vistoria
          </Typography>
          <Typography variant="body1">
            {formatDate(inspection.next_inspection_date)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Caminhão
          </Typography>
          <Typography variant="body1">
            {inspection.truck_plate} - {inspection.truck_model}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Motorista
          </Typography>
          <Typography variant="body1">
            {inspection.driver_name}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Quilometragem
          </Typography>
          <Typography variant="body1">
            {inspection.mileage} km
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Nível de Combustível
          </Typography>
          <Typography variant="body1">
            {inspection.fuel_level}%
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Condição dos Freios</Typography>
          <Typography variant="body2" color="textSecondary">
            {inspection.brake_condition === 'good' ? 'Bom' : 
             inspection.brake_condition === 'regular' ? 'Regular' : 'Ruim'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Condição Geral</Typography>
          <Typography variant="body2" color="textSecondary">
            {inspection.general_condition === 'good' ? 'Bom' : 
             inspection.general_condition === 'regular' ? 'Regular' : 'Ruim'}
          </Typography>
        </Grid>

        {inspection.observations && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Observações
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {inspection.observations}
            </Typography>
          </Grid>
        )}

        {inspection.photos && inspection.photos.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Fotos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {inspection.photos.map((photo, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 150,
                    height: 150,
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePhotoClick(index)}
                >
                  <img
                    src={`/api/uploads/${photo.path}`}
                    alt={`Foto ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Fechar
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={() => setPhotoDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'background.paper' }}
          >
            <Close />
          </IconButton>
          
          {inspection?.photos?.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevPhoto}
                sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'background.paper' }}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                onClick={handleNextPhoto}
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'background.paper' }}
              >
                <NavigateNext />
              </IconButton>
            </>
          )}
          
          <img
            src={`/api/uploads/${inspection?.photos[selectedPhotoIndex]?.path}`}
            alt={`Foto ${selectedPhotoIndex + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default InspectionDetails; 