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
  CircularProgress,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Menu as MenuIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Assignment as InspectionIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importar componentes
import InspectionDashboard from './components/inspections/InspectionDashboard';
import InspectionList from './components/inspections/InspectionList';
import InspectionDetails from './components/inspections/InspectionDetails';
import DriverList from './components/drivers/DriverList';
import TruckList from './components/trucks/TruckList';
import Layout from './components/Layout';
import InspectionPage from './pages/InspectionPage';
import InspectionSuccessPage from './pages/InspectionSuccessPage';

const API_URL = '/api';

const vehicleTypes = [
  'Caminhão Baú',
  'Caminhão Tanque',
  'Carreta',
  'Bitrem',
  'VUC',
  'Outros'
];

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    cnh: '',
    vehicleType: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    cnh: '',
    cnhExpirationDate: '',
    vehicleType: '',
    photo: null
  });

  const themeMui = useTheme();
  const isMobile = useMediaQuery(themeMui.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
    { text: 'Motoristas', icon: <PersonIcon />, view: 'drivers' },
    { text: 'Caminhões', icon: <CarIcon />, view: 'trucks' },
    { text: 'Vistorias', icon: <InspectionIcon />, view: 'inspections' },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              setCurrentView(item.view);
              if (isMobile) setMobileOpen(false);
            }}
            selected={currentView === item.view}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.cnh) params.append('cnh', filters.cnh);
      if (filters.vehicleType) params.append('vehicleType', filters.vehicleType);

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
        cnh: '',
        cnhExpirationDate: '',
        vehicleType: '',
        photo: null
      });
      setEditingDriver(null);
      setOpenDialog(false);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert(error.response?.data?.error || 'Erro ao salvar motorista');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        await axios.delete(`${API_URL}/drivers/${id}`);
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Erro ao excluir motorista');
      }
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      cnh: driver.cnh,
      cnhExpirationDate: driver.cnhExpirationDate,
      vehicleType: driver.vehicleType,
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
      cnh: '',
      vehicleType: ''
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <InspectionDashboard />;
      case 'drivers':
        return <DriverList />;
      case 'trucks':
        return <TruckList />;
      case 'inspections':
        if (selectedInspection) {
          return (
            <InspectionDetails
              inspectionId={selectedInspection}
              onClose={() => setSelectedInspection(null)}
            />
          );
        }
        return (
          <InspectionList
            onInspectionSelect={setSelectedInspection}
          />
        );
      default:
        return <InspectionDashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/inspection/:token" element={<InspectionPage />} />
          <Route path="/inspection/success" element={<InspectionSuccessPage />} />

          {/* Rotas protegidas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<DriverList />} />
            <Route path="drivers" element={<DriverList />} />
            <Route path="trucks" element={<TruckList />} />
            <Route path="inspections" element={<InspectionList />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 