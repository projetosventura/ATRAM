import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import axios from 'axios';

const InspectionForm = ({ inspectionId = null }) => {
  const [formData, setFormData] = useState({
    truck_id: '',
    driver_id: '',
    inspection_date: new Date().toISOString().split('T')[0],
    mileage: '',
    fuel_level: '',
    tire_condition: '',
    brake_condition: '',
    oil_level: '',
    general_condition: '',
    observations: '',
    next_inspection_date: '',
    status: 'pending'
  });

  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [inspectionId]);

  const fetchInitialData = async () => {
    try {
      const [trucksRes, driversRes] = await Promise.all([
        axios.get('/api/trucks'),
        axios.get('/api/drivers')
      ]);

      setTrucks(trucksRes.data);
      setDrivers(driversRes.data);

      if (inspectionId) {
        const inspectionRes = await axios.get(`/api/inspections/${inspectionId}`);
        setFormData(inspectionRes.data);
        setPhotos(inspectionRes.data.photos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo quando ele for alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.truck_id) newErrors.truck_id = 'Selecione um caminhão';
    if (!formData.driver_id) newErrors.driver_id = 'Selecione um associado';
    if (!formData.inspection_date) newErrors.inspection_date = 'Informe a data da vistoria';
    if (!formData.mileage || formData.mileage <= 0) newErrors.mileage = 'Informe a quilometragem';
    if (!formData.fuel_level || formData.fuel_level < 0 || formData.fuel_level > 100) {
      newErrors.fuel_level = 'Nível de combustível deve estar entre 0 e 100';
    }
    if (!formData.brake_condition) newErrors.brake_condition = 'Informe a condição dos freios';
    if (!formData.general_condition) newErrors.general_condition = 'Informe a condição geral';
    if (!formData.next_inspection_date) newErrors.next_inspection_date = 'Informe a data da próxima vistoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Adicionar dados do formulário
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Adicionar fotos
      photos.forEach(photo => {
        if (photo.file) {
          formDataToSend.append('photos', photo.file);
        }
      });

      if (inspectionId) {
        await axios.put(`/api/inspections/${inspectionId}`, formDataToSend);
      } else {
        await axios.post('/api/inspections', formDataToSend);
      }

      // Redirecionar ou mostrar mensagem de sucesso
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Erro ao salvar vistoria. Tente novamente.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {inspectionId ? 'Editar Vistoria' : 'Nova Vistoria'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.truck_id}>
              <InputLabel>Caminhão</InputLabel>
              <Select
                name="truck_id"
                value={formData.truck_id}
                onChange={handleChange}
                label="Caminhão"
              >
                {trucks.map(truck => (
                  <MenuItem key={truck.id} value={truck.id}>
                    {truck.plate} - {truck.model}
                  </MenuItem>
                ))}
              </Select>
              {errors.truck_id && <FormHelperText>{errors.truck_id}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.driver_id}>
              <InputLabel>Associado</InputLabel>
              <Select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                label="Associado"
              >
                {drivers.map(driver => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.driver_id && <FormHelperText>{errors.driver_id}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data da Vistoria"
              name="inspection_date"
              value={formData.inspection_date}
              onChange={handleChange}
              error={!!errors.inspection_date}
              helperText={errors.inspection_date}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Quilometragem"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              error={!!errors.mileage}
              helperText={errors.mileage}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Nível de Combustível (%)"
              name="fuel_level"
              value={formData.fuel_level}
              onChange={handleChange}
              error={!!errors.fuel_level}
              helperText={errors.fuel_level}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.brake_condition}>
              <InputLabel>Condição dos Freios</InputLabel>
              <Select
                name="brake_condition"
                value={formData.brake_condition}
                onChange={handleChange}
                label="Condição dos Freios"
              >
                <MenuItem value="good">Bom</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="bad">Ruim</MenuItem>
              </Select>
              {errors.brake_condition && <FormHelperText>{errors.brake_condition}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.general_condition}>
              <InputLabel>Condição Geral</InputLabel>
              <Select
                name="general_condition"
                value={formData.general_condition}
                onChange={handleChange}
                label="Condição Geral"
              >
                <MenuItem value="good">Bom</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="bad">Ruim</MenuItem>
              </Select>
              {errors.general_condition && <FormHelperText>{errors.general_condition}</FormHelperText>}
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Próxima Vistoria"
              name="next_inspection_date"
              value={formData.next_inspection_date}
              onChange={handleChange}
              error={!!errors.next_inspection_date}
              helperText={errors.next_inspection_date}
              InputLabelProps={{ shrink: true }}
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
              multiple
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Adicionar Fotos
              </Button>
            </label>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {photos.map((photo, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                  }}
                >
                  <img
                    src={photo.preview || `/api/uploads/${photo.path}`}
                    alt={`Foto ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      bgcolor: 'background.paper',
                    }}
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>

          {errors.submit && (
            <Grid item xs={12}>
              <Typography color="error">{errors.submit}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="outlined">
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default InspectionForm; 