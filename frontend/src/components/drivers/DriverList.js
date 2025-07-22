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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    cpf: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    photo: null
  });

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.cpf) params.append('cpf', filters.cpf);

      const response = await axios.get(`${API_URL}/drivers?${params.toString()}`);
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingDriver) {
        await axios.put(`${API_URL}/drivers/${editingDriver.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/drivers`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      setFormData({
        name: '',
        cpf: '',
        photo: null
      });
      setEditingDriver(null);
      setOpenDialog(false);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert(error.response?.data?.error || 'Erro ao salvar associado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este associado?')) {
      try {
        await axios.delete(`${API_URL}/drivers/${id}`);
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Erro ao excluir associado');
      }
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      cpf: driver.cpf,
      photo: null
    });
    setOpenDialog(true);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      cpf: ''
    });
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Associados
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
                  label="Buscar por CPF"
                  value={filters.cpf}
                  onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
                />
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
            onClick={() => {
              setEditingDriver(null);
              setFormData({
                name: '',
                cpf: '',
                photo: null
              });
              setOpenDialog(true);
            }}
          >
            Novo Associado
          </Button>
        </Box>

        <Grid container spacing={3}>
          {drivers.map((driver) => (
            <Grid item xs={12} sm={6} md={4} key={driver.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {driver.photo && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/api${driver.photo}`}
                    alt={`Foto de ${driver.name}`}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {driver.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CPF: {driver.cpf}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <IconButton onClick={() => handleEdit(driver)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(driver.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingDriver ? 'Editar Associado' : 'Novo Associado'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CPF"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    required
                  />
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
      </Box>
    </Container>
  );
};

export default DriverList; 