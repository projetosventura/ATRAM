import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importar componentes
import InspectionDashboard from './components/inspections/InspectionDashboard';
import InspectionList from './components/inspections/InspectionList';
import InspectionDetails from './components/inspections/InspectionDetails';
import DriverList from './components/drivers/DriverList';
import TruckList from './components/trucks/TruckList';
import VehicleSetList from './components/vehicles/VehicleSetList';
import Layout from './components/Layout';
import InspectionPage from './pages/InspectionPage';
import InspectionSuccessPage from './pages/InspectionSuccessPage';

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
            <Route path="vehicle-sets" element={<VehicleSetList />} />
            <Route path="inspections" element={<InspectionList />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 