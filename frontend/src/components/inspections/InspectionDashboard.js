import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Error,
  Schedule,
} from '@mui/icons-material';
import axios from 'axios';

const InspectionDashboard = () => {
  const [stats, setStats] = useState({
    pending: [],
    expired: [],
    nextInspections: [],
    totalInspections: 0,
    approvedInspections: 0,
    rejectedInspections: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        pendingRes,
        expiredRes,
        allInspectionsRes
      ] = await Promise.all([
        axios.get('/api/inspections?status=pending'),
        axios.get('/api/inspections/expired'),
        axios.get('/api/inspections')
      ]);

      const allInspections = allInspectionsRes.data;
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const nextInspections = allInspections.filter(inspection => {
        const inspectionDate = new Date(inspection.next_inspection_date);
        return inspectionDate <= nextWeek && inspection.status !== 'rejected';
      });

      setStats({
        pending: pendingRes.data,
        expired: expiredRes.data,
        nextInspections,
        totalInspections: allInspections.length,
        approvedInspections: allInspections.filter(i => i.status === 'approved').length,
        rejectedInspections: allInspections.filter(i => i.status === 'rejected').length
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Vistorias
      </Typography>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total de Vistorias</Typography>
              </Box>
              <Typography variant="h4">{stats.totalInspections}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Aprovadas</Typography>
              </Box>
              <Typography variant="h4">{stats.approvedInspections}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Pendentes</Typography>
              </Box>
              <Typography variant="h4">{stats.pending.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Error sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Rejeitadas</Typography>
              </Box>
              <Typography variant="h4">{stats.rejectedInspections}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Listas de Vistorias */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Vistorias Pendentes
            </Typography>
            <List>
              {stats.pending.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Nenhuma vistoria pendente" />
                </ListItem>
              ) : (
                stats.pending.map((inspection, index) => (
                  <React.Fragment key={inspection.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${inspection.truck_plate} - ${inspection.truck_model}`}
                        secondary={`Data: ${formatDate(inspection.inspection_date)}`}
                      />
                      <Chip
                        label="Pendente"
                        color="warning"
                        size="small"
                      />
                    </ListItem>
                    {index < stats.pending.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Vistorias Vencidas
            </Typography>
            <List>
              {stats.expired.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Nenhuma vistoria vencida" />
                </ListItem>
              ) : (
                stats.expired.map((inspection, index) => (
                  <React.Fragment key={inspection.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${inspection.truck_plate} - ${inspection.truck_model}`}
                        secondary={`Vencimento: ${formatDate(inspection.next_inspection_date)}`}
                      />
                      <Chip
                        label="Vencida"
                        color="error"
                        size="small"
                      />
                    </ListItem>
                    {index < stats.expired.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Vistorias (7 dias)
            </Typography>
            <List>
              {stats.nextInspections.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Nenhuma vistoria programada para os próximos 7 dias" />
                </ListItem>
              ) : (
                stats.nextInspections.map((inspection, index) => (
                  <React.Fragment key={inspection.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${inspection.truck_plate} - ${inspection.truck_model}`}
                        secondary={`Data Programada: ${formatDate(inspection.next_inspection_date)}`}
                      />
                      <Chip
                        label="Agendada"
                        color="info"
                        size="small"
                      />
                    </ListItem>
                    {index < stats.nextInspections.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InspectionDashboard; 