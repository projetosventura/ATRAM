import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

const conditions = [
  { value: 'good', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'bad', label: 'Ruim' },
];

const PublicInspectionForm = ({ token }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inspectionData, setInspectionData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    mileage: '',
    fuel_level: '',
    tire_condition: '',
    brake_condition: '',
    oil_level: '',
    general_condition: '',
    observations: ''
  });

  useEffect(() => {
    fetchInspectionData();
  }, [token]);

  const fetchInspectionData = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspection-requests/${token}`);
      
      // Se a vistoria já foi preenchida, redireciona para a página de sucesso
      if (response.data.inspection_date) {
        navigate('/inspection/success');
        return;
      }
      
      setInspectionData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inspection data:', error);
      alert('Erro ao carregar dados da vistoria');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return; // Previne envios múltiplos
    
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo.file);
      });

      await axios.post(
        `${API_URL}/inspection-requests/${token}/submit`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate('/inspection/success');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      alert(error.response?.data?.error || 'Erro ao enviar vistoria');
      setSubmitting(false); // Só reseta o submitting em caso de erro
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!inspectionData) {
    return (
      <Container>
        <Typography variant="h5" color="error" align="center" sx={{ mt: 4 }}>
          Vistoria não encontrada ou já preenchida
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Formulário de Vistoria
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1">
            Caminhão: {inspectionData.truck_plate} - {inspectionData.truck_model}
          </Typography>
          <Typography variant="subtitle1">
            Motorista: {inspectionData.driver_name}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quilometragem"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nível de Combustível (%)"
                name="fuel_level"
                type="number"
                value={formData.fuel_level}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Condição dos Pneus</InputLabel>
                <Select
                  name="tire_condition"
                  value={formData.tire_condition}
                  onChange={handleChange}
                  label="Condição dos Pneus"
                >
                  {conditions.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Condição dos Freios</InputLabel>
                <Select
                  name="brake_condition"
                  value={formData.brake_condition}
                  onChange={handleChange}
                  label="Condição dos Freios"
                >
                  {conditions.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Nível do Óleo</InputLabel>
                <Select
                  name="oil_level"
                  value={formData.oil_level}
                  onChange={handleChange}
                  label="Nível do Óleo"
                >
                  {conditions.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Condição Geral</InputLabel>
                <Select
                  name="general_condition"
                  value={formData.general_condition}
                  onChange={handleChange}
                  label="Condição Geral"
                >
                  {conditions.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observações"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Fotos da Vistoria
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                multiple
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Adicionar Fotos
                </Button>
              </label>
            </Grid>

            {photos.length > 0 && (
              <Grid item xs={12}>
                <ImageList cols={3} gap={8}>
                  {photos.map((photo, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={photo.preview}
                        alt={`Foto ${index + 1}`}
                        loading="lazy"
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                      <ImageListItemBar
                        actionIcon={
                          <IconButton
                            sx={{ color: 'white' }}
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitting}
                sx={{ mt: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Enviar Vistoria'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PublicInspectionForm; 