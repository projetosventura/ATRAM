import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';
import InspectionRequestButton from '../inspections/InspectionRequestButton';

const API_URL = 'http://localhost:3001/api';

const vehicleTypes = [
  'Caminhão Baú',
  'Caminhão Tanque',
  'Carreta',
  'Bitrem',
  'VUC',
  'Outros'
];

const TruckList = () => {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [filters, setFilters] = useState({
    plate: '',
    model: '',
    vehicleType: ''
  });

  const [formData, setFormData] = useState({
    plate: '',
    chassis: '',
    model: '',
    brand: '',
    year: '',
    type: '',
    capacity: '',
    photo: null
  });

  const fetchTrucks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.plate) params.append('plate', filters.plate);
      if (filters.model) params.append('model', filters.model);
      if (filters.vehicleType) params.append('type', filters.vehicleType);

      const response = await axios.get(`${API_URL}/trucks?${params.toString()}`);
      console.log('Trucks response:', response.data);
      setTrucks(response.data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/drivers`);
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  useEffect(() => {
    fetchTrucks();
    fetchDrivers();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('plate', formData.plate.toUpperCase());
      formDataToSend.append('chassis', formData.chassis.toUpperCase());
      formDataToSend.append('model', formData.model);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('capacity', formData.capacity);
      
      if (formData.photo instanceof File) {
        formDataToSend.append('photo', formData.photo);
      }

      if (editingTruck) {
        await axios.put(`${API_URL}/trucks/${editingTruck.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/trucks`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setFormData({
        plate: '',
        chassis: '',
        model: '',
        brand: '',
        year: '',
        type: '',
        capacity: '',
        photo: null
      });
      setEditingTruck(null);
      setOpenDialog(false);
      fetchTrucks();
    } catch (error) {
      console.error('Error saving truck:', error);
      alert(error.response?.data?.error || 'Erro ao salvar caminhão');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este caminhão?')) {
      try {
        await axios.delete(`${API_URL}/trucks/${id}`);
        fetchTrucks();
      } catch (error) {
        console.error('Error deleting truck:', error);
        alert('Erro ao excluir caminhão');
      }
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setFormData({
      plate: truck.plate,
      chassis: truck.chassis,
      model: truck.model,
      brand: truck.brand,
      year: truck.year,
      type: truck.type,
      capacity: truck.capacity,
      photo: null
    });
    setOpenDialog(true);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const clearFilters = () => {
    setFilters({
      plate: '',
      model: '',
      vehicleType: ''
    });
  };

  const handleInspectionClick = (truck) => {
    setSelectedTruck(truck);
    setSelectedDriver('');
    setOpenInspectionDialog(true);
  };

  const handleDriverSelect = () => {
    if (!selectedDriver) {
      alert('Por favor, selecione um motorista');
      return;
    }
    setOpenInspectionDialog(false);
  };

  const handleCloseInspectionDialog = () => {
    setOpenInspectionDialog(false);
    setSelectedTruck(null);
    setSelectedDriver('');
  };

  const handleInspectionComplete = () => {
    setSelectedTruck(null);
    setSelectedDriver('');
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Caminhões
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Buscar por Placa"
                  value={filters.plate}
                  onChange={(e) => setFilters({ ...filters, plate: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Buscar por Modelo"
                  value={filters.model}
                  onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Veículo"
                  value={filters.vehicleType}
                  onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  fullWidth
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingTruck(null);
              setFormData({
                plate: '',
                chassis: '',
                model: '',
                brand: '',
                year: '',
                type: '',
                capacity: '',
                photo: null
              });
              setOpenDialog(true);
            }}
          >
            Novo Caminhão
          </Button>
        </Box>

        <Grid container spacing={3}>
          {trucks.map((truck) => (
            <Grid item xs={12} sm={6} md={4} key={truck.id}>
              <Card>
                {truck.photo && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={truck.photo}
                    alt={`Foto do caminhão ${truck.plate}`}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">Placa: {truck.plate}</Typography>
                  <Typography color="textSecondary">Chassi: {truck.chassis}</Typography>
                  <Typography color="textSecondary">Marca/Modelo: {truck.brand} {truck.model}</Typography>
                  <Typography color="textSecondary">Ano: {truck.year}</Typography>
                  <Typography color="textSecondary">Tipo: {truck.type}</Typography>
                  <Typography color="textSecondary">Capacidade: {truck.capacity} kg</Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <IconButton onClick={() => handleEdit(truck)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(truck.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleInspectionClick(truck)}
                    >
                      Gerar Link de Vistoria
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTruck ? 'Editar Caminhão' : 'Novo Caminhão'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Placa"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    required
                    helperText="Formato: ABC1234 ou ABC1D23"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Chassi"
                    value={formData.chassis}
                    onChange={(e) => setFormData({ ...formData, chassis: e.target.value.toUpperCase() })}
                    required
                    helperText="17 caracteres"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Modelo"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Marca"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ano"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Capacidade (kg)"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Veículo"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                    style={{ marginBottom: '1rem' }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Salvar'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog 
          open={openInspectionDialog} 
          onClose={handleCloseInspectionDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Selecionar Motorista para Vistoria</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Motorista</InputLabel>
                <Select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  label="Motorista"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name} - CNH: {driver.cnh}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInspectionDialog}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDriverSelect}
              disabled={!selectedDriver}
            >
              Continuar
            </Button>
          </DialogActions>
        </Dialog>

        {selectedTruck && selectedDriver && !openInspectionDialog && (
          <InspectionRequestButton
            truck={selectedTruck}
            driver={{ id: selectedDriver }}
            onComplete={handleInspectionComplete}
          />
        )}
      </Box>
    </Container>
  );
};

export default TruckList; 