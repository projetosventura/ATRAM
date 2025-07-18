import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api';

const conditions = {
  good: { label: 'Bom', color: 'success' },
  regular: { label: 'Regular', color: 'warning' },
  bad: { label: 'Ruim', color: 'error' },
};

const InspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    truck_plate: '',
    driver_name: '',
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, [filters]);

  const fetchInspections = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspection-requests`, {
        params: filters
      });
      setInspections(response.data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      alert('Erro ao carregar vistorias');
    }
  };

  const handleViewInspection = async (inspection) => {
    try {
      const photosResponse = await axios.get(`${API_URL}/inspection-requests/${inspection.id}/photos`);
      setSelectedInspection({
        ...inspection,
        photos: photosResponse.data
      });
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching inspection details:', error);
      alert('Erro ao carregar detalhes da vistoria');
    }
  };

  const handleViewPhotos = (photos) => {
    setSelectedPhotos(photos);
    setPhotoDialogOpen(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/inspection-requests/${id}/status`, { status });
      fetchInspections();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating inspection status:', error);
      alert('Erro ao atualizar status da vistoria');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pendente" color="warning" />;
      case 'approved':
        return <Chip label="Aprovada" color="success" />;
      case 'rejected':
        return <Chip label="Reprovada" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  const getConditionChip = (condition) => {
    const { label, color } = conditions[condition] || { label: condition, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Vistorias
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Placa do Caminhão"
                value={filters.truck_plate}
                onChange={(e) => setFilters({ ...filters, truck_plate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nome do Motorista"
                value={filters.driver_name}
                onChange={(e) => setFilters({ ...filters, driver_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="approved">Aprovada</MenuItem>
                  <MenuItem value="rejected">Reprovada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Caminhão</TableCell>
                <TableCell>Motorista</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell>
                    {new Date(inspection.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {inspection.vehicle_info?.type === 'vehicle_set' ? (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {inspection.vehicle_info.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {inspection.vehicle_info.set_type === 'cavalo' ? 'Apenas Cavalo' : 
                           inspection.vehicle_info.set_type === 'carreta' ? 'Apenas Carreta' : 
                           'Conjugado'}
                        </Typography>
                        {inspection.vehicle_info.cavalo && (
                          <Typography variant="caption" display="block">
                            Cavalo: {inspection.vehicle_info.cavalo.plate}
                          </Typography>
                        )}
                        {inspection.vehicle_info.carreta && (
                          <Typography variant="caption" display="block">
                            Carreta: {inspection.vehicle_info.carreta.plate}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      inspection.truck_plate
                    )}
                  </TableCell>
                  <TableCell>{inspection.driver_name}</TableCell>
                  <TableCell>{getStatusChip(inspection.status)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewInspection(inspection)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedInspection && (
            <>
              <DialogTitle>
                Detalhes da Vistoria
                <Box component="span" sx={{ float: 'right' }}>
                  {getStatusChip(selectedInspection.status)}
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">
                      {selectedInspection.vehicle_info?.type === 'vehicle_set' ? 'Conjunto de Veículos' : 'Caminhão'}
                    </Typography>
                    <Typography>
                      {selectedInspection.vehicle_info?.type === 'vehicle_set' ? (
                        <>
                          {selectedInspection.vehicle_info.name} ({selectedInspection.vehicle_info.set_type === 'cavalo' ? 'Apenas Cavalo' : 
                          selectedInspection.vehicle_info.set_type === 'carreta' ? 'Apenas Carreta' : 
                          'Conjugado'})
                          {selectedInspection.vehicle_info.cavalo && (
                            <Box component="div" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" display="block">
                                Cavalo: {selectedInspection.vehicle_info.cavalo.plate} - {selectedInspection.vehicle_info.cavalo.brand} {selectedInspection.vehicle_info.cavalo.model}
                              </Typography>
                            </Box>
                          )}
                          {selectedInspection.vehicle_info.carreta && (
                            <Box component="div" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" display="block">
                                Carreta: {selectedInspection.vehicle_info.carreta.plate} - {selectedInspection.vehicle_info.carreta.brand} {selectedInspection.vehicle_info.carreta.model}
                              </Typography>
                            </Box>
                          )}
                        </>
                      ) : (
                        `${selectedInspection.truck_plate} - ${selectedInspection.truck_model}`
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Motorista</Typography>
                    <Typography>{selectedInspection.driver_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Quilometragem</Typography>
                    <Typography>{selectedInspection.mileage} km</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Nível de Combustível</Typography>
                    <Typography>{selectedInspection.fuel_level}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Condição dos Freios</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedInspection.brake_condition === 'good' ? 'Bom' :
                       selectedInspection.brake_condition === 'regular' ? 'Regular' : 'Ruim'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Condição Geral</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedInspection.general_condition === 'good' ? 'Bom' :
                       selectedInspection.general_condition === 'regular' ? 'Regular' : 'Ruim'}
                    </Typography>
                  </Grid>
                  {selectedInspection.observations && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Observações</Typography>
                      <Typography>{selectedInspection.observations}</Typography>
                    </Grid>
                  )}
                  {selectedInspection.photos && selectedInspection.photos.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2">Fotos</Typography>
                        <Button
                          startIcon={<PhotoCameraIcon />}
                          onClick={() => handleViewPhotos(selectedInspection.photos)}
                          size="small"
                        >
                          Ver todas ({selectedInspection.photos.length})
                        </Button>
                      </Box>
                      <ImageList cols={3} gap={8} sx={{ maxHeight: 200 }}>
                        {selectedInspection.photos.slice(0, 3).map((photo, index) => (
                          <ImageListItem key={index}>
                            <img
                              src={photo}
                              alt={`Foto ${index + 1}`}
                              loading="lazy"
                              style={{ height: 100, objectFit: 'cover' }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {selectedInspection.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleUpdateStatus(selectedInspection.id, 'rejected')}
                      color="error"
                      startIcon={<CloseIcon />}
                    >
                      Reprovar
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedInspection.id, 'approved')}
                      color="success"
                      startIcon={<CheckIcon />}
                    >
                      Aprovar
                    </Button>
                  </>
                )}
                <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog
          open={photoDialogOpen}
          onClose={() => setPhotoDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Fotos da Vistoria</DialogTitle>
          <DialogContent>
            <ImageList cols={3} gap={8}>
              {selectedPhotos.map((photo, index) => (
                <ImageListItem key={index}>
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    loading="lazy"
                    style={{ width: '100%', height: 300, objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPhotoDialogOpen(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default InspectionList; 