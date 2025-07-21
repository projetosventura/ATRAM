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
  Chip,
  FormHelperText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import InspectionRequestButton from '../inspections/InspectionRequestButton';

const API_URL = '/api';

const vehicleSetTypes = [
  { value: 'cavalo', label: 'Apenas Cavalo' },
  { value: 'carreta', label: 'Apenas Carreta' },
  { value: 'conjugado', label: 'Conjugado (Cavalo + Carreta)' },
  { value: 'bitrem', label: 'Bitrem (Cavalo + Carreta + Dolly)' }
];

const VehicleSetList = () => {
  const [vehicleSets, setVehicleSets] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableCavalos, setAvailableCavalos] = useState([]);
  const [availableCarretas, setAvailableCarretas] = useState([]);
  const [availableDollies, setAvailableDollies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVehicleSet, setEditingVehicleSet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
  const [selectedVehicleSet, setSelectedVehicleSet] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    type: ''
  });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    cavalo_id: '',
    carreta_id: '',
    dolly_id: '',
    description: ''
  });

  const fetchVehicleSets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.type) params.append('type', filters.type);

      const response = await axios.get(`${API_URL}/vehicle-sets?${params.toString()}`);
      console.log('Vehicle sets response:', response.data);
      setVehicleSets(response.data);
    } catch (error) {
      console.error('Error fetching vehicle sets:', error);
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

  const fetchAvailableVehicles = async (excludeSetId = null) => {
    try {
      const [cavalosResponse, carretasResponse, dolliesResponse] = await Promise.all([
        axios.get(`${API_URL}/vehicle-sets/available/cavalos${excludeSetId ? `?excludeSetId=${excludeSetId}` : ''}`),
        axios.get(`${API_URL}/vehicle-sets/available/carretas${excludeSetId ? `?excludeSetId=${excludeSetId}` : ''}`),
        axios.get(`${API_URL}/vehicle-sets/available/dollies${excludeSetId ? `?excludeSetId=${excludeSetId}` : ''}`)
      ]);
      setAvailableCavalos(cavalosResponse.data);
      setAvailableCarretas(carretasResponse.data);
      setAvailableDollies(dolliesResponse.data);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicleSets();
    fetchDrivers();
    fetchAvailableVehicles();
  }, [filters]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }
    if (formData.type === 'cavalo' && !formData.cavalo_id) {
      newErrors.cavalo_id = 'Cavalo é obrigatório para este tipo';
    }
    if (formData.type === 'carreta' && !formData.carreta_id) {
      newErrors.carreta_id = 'Carreta é obrigatória para este tipo';
    }
    if (formData.type === 'conjugado') {
      if (!formData.cavalo_id) {
        newErrors.cavalo_id = 'Cavalo é obrigatório para conjugado';
      }
      if (!formData.carreta_id) {
        newErrors.carreta_id = 'Carreta é obrigatória para conjugado';
      }
    }
    if (formData.type === 'bitrem') {
      if (!formData.cavalo_id) {
        newErrors.cavalo_id = 'Cavalo é obrigatório para bitrem';
      }
      if (!formData.carreta_id) {
        newErrors.carreta_id = 'Carreta é obrigatória para bitrem';
      }
      if (!formData.dolly_id) {
        newErrors.dolly_id = 'Dolly é obrigatório para bitrem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSend = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        cavalo_id: formData.cavalo_id || null,
        carreta_id: formData.carreta_id || null,
        dolly_id: formData.dolly_id || null
      };

      if (editingVehicleSet) {
        await axios.put(`${API_URL}/vehicle-sets/${editingVehicleSet.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/vehicle-sets`, dataToSend);
      }
      
      resetForm();
      setOpenDialog(false);
      fetchVehicleSets();
      fetchAvailableVehicles();
    } catch (error) {
      console.error('Error saving vehicle set:', error);
      alert(error.response?.data?.error || 'Erro ao salvar conjunto de veículos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      cavalo_id: '',
      carreta_id: '',
      dolly_id: '',
      description: ''
    });
    setEditingVehicleSet(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este conjunto de veículos?')) {
      try {
        await axios.delete(`${API_URL}/vehicle-sets/${id}`);
        fetchVehicleSets();
        fetchAvailableVehicles();
      } catch (error) {
        console.error('Error deleting vehicle set:', error);
        alert('Erro ao excluir conjunto de veículos');
      }
    }
  };

  const handleEdit = (vehicleSet) => {
    setEditingVehicleSet(vehicleSet);
    setFormData({
      name: vehicleSet.name,
      type: vehicleSet.type,
      cavalo_id: vehicleSet.cavalo_id || '',
      carreta_id: vehicleSet.carreta_id || '',
      dolly_id: vehicleSet.dolly_id || '',
      description: vehicleSet.description || ''
    });
    fetchAvailableVehicles(vehicleSet.id);
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      type: ''
    });
  };

  const handleInspectionClick = (vehicleSet) => {
    setSelectedVehicleSet(vehicleSet);
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
    setSelectedVehicleSet(null);
    setSelectedDriver('');
  };

  const handleInspectionComplete = () => {
    setSelectedVehicleSet(null);
    setSelectedDriver('');
  };

  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      cavalo_id: newType === 'carreta' ? '' : formData.cavalo_id,
      carreta_id: newType === 'cavalo' ? '' : formData.carreta_id,
      dolly_id: newType !== 'bitrem' ? '' : formData.dolly_id
    });
    setErrors({ ...errors, type: '', cavalo_id: '', carreta_id: '', dolly_id: '' });
  };

  const getVehicleSetIcon = (type) => {
    switch (type) {
      case 'cavalo': return '🚛';
      case 'carreta': return '📦';
      case 'conjugado': return '🚛📦';
      case 'bitrem': return '🚛📦🔗';
      default: return '🚛';
    }
  };

  const getVehicleSetDescription = (vehicleSet) => {
    const parts = [];
    if (vehicleSet.cavalo_info) {
      parts.push(`Cavalo: ${vehicleSet.cavalo_info.plate} (${vehicleSet.cavalo_info.brand} ${vehicleSet.cavalo_info.model})`);
    }
    if (vehicleSet.carreta_info) {
      parts.push(`Carreta: ${vehicleSet.carreta_info.plate} (${vehicleSet.carreta_info.brand} ${vehicleSet.carreta_info.model})`);
    }
    if (vehicleSet.dolly_info) {
      parts.push(`Dolly: ${vehicleSet.dolly_info.plate} (${vehicleSet.dolly_info.brand} ${vehicleSet.dolly_info.model})`);
    }
    return parts.join(' | ');
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Conjuntos de Veículos
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Buscar por Nome"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Conjunto"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {vehicleSetTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
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
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              fetchAvailableVehicles();
              setOpenDialog(true);
            }}
          >
            Novo Conjunto de Veículos
          </Button>
        </Box>

        <Grid container spacing={3}>
          {vehicleSets.map((vehicleSet) => (
            <Grid item xs={12} sm={6} md={4} key={vehicleSet.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ mr: 1 }}>
                      {getVehicleSetIcon(vehicleSet.type)}
                    </Typography>
                    <Typography variant="h6">{vehicleSet.name}</Typography>
                  </Box>
                  
                  <Chip 
                    label={vehicleSetTypes.find(t => t.value === vehicleSet.type)?.label || vehicleSet.type}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {getVehicleSetDescription(vehicleSet)}
                  </Typography>
                  
                  {vehicleSet.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                      {vehicleSet.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <IconButton onClick={() => handleEdit(vehicleSet)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(vehicleSet.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleInspectionClick(vehicleSet)}
                      size="small"
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
            {editingVehicleSet ? 'Editar Conjunto de Veículos' : 'Novo Conjunto de Veículos'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Conjunto"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Tipo de Conjunto</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      label="Tipo de Conjunto"
                      required
                    >
                      {vehicleSetTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                  </FormControl>
                </Grid>

                {(formData.type === 'cavalo' || formData.type === 'conjugado' || formData.type === 'bitrem') && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.cavalo_id}>
                      <InputLabel>Cavalo Mecânico</InputLabel>
                      <Select
                        value={formData.cavalo_id}
                        onChange={(e) => setFormData({ ...formData, cavalo_id: e.target.value })}
                        label="Cavalo Mecânico"
                        required={formData.type === 'cavalo' || formData.type === 'conjugado' || formData.type === 'bitrem'}
                      >
                        {availableCavalos.map((cavalo) => (
                          <MenuItem key={cavalo.id} value={cavalo.id}>
                            {cavalo.plate} - {cavalo.brand} {cavalo.model} ({cavalo.year})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cavalo_id && <FormHelperText>{errors.cavalo_id}</FormHelperText>}
                    </FormControl>
                  </Grid>
                )}

                {(formData.type === 'carreta' || formData.type === 'conjugado' || formData.type === 'bitrem') && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.carreta_id}>
                      <InputLabel>Carreta/Reboque</InputLabel>
                      <Select
                        value={formData.carreta_id}
                        onChange={(e) => setFormData({ ...formData, carreta_id: e.target.value })}
                        label="Carreta/Reboque"
                        required={formData.type === 'carreta' || formData.type === 'conjugado' || formData.type === 'bitrem'}
                      >
                        {availableCarretas.map((carreta) => (
                          <MenuItem key={carreta.id} value={carreta.id}>
                            {carreta.plate} - {carreta.brand} {carreta.model} ({carreta.year})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.carreta_id && <FormHelperText>{errors.carreta_id}</FormHelperText>}
                    </FormControl>
                  </Grid>
                )}

                {formData.type === 'bitrem' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.dolly_id}>
                      <InputLabel>Dolly</InputLabel>
                      <Select
                        value={formData.dolly_id}
                        onChange={(e) => setFormData({ ...formData, dolly_id: e.target.value })}
                        label="Dolly"
                        required={formData.type === 'bitrem'}
                      >
                        {availableDollies.map((dolly) => (
                          <MenuItem key={dolly.id} value={dolly.id}>
                            {dolly.plate} - {dolly.brand} {dolly.model} ({dolly.year})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.dolly_id && <FormHelperText>{errors.dolly_id}</FormHelperText>}
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição (Opcional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={3}
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
          <DialogTitle>Selecionar Associado para Vistoria</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Associado</InputLabel>
                <Select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  label="Associado"
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

        {selectedVehicleSet && selectedDriver && !openInspectionDialog && (
          <InspectionRequestButton
            vehicleSet={selectedVehicleSet}
            driver={{ id: selectedDriver }}
            onComplete={handleInspectionComplete}
          />
        )}
      </Box>
    </Container>
  );
};

export default VehicleSetList; 