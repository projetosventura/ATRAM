const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const initializeDatabase = require('./infrastructure/database/init');
const DriverRepository = require('./infrastructure/repositories/DriverRepository');
const DriverService = require('./application/services/DriverService');
const DriverController = require('./interfaces/controllers/DriverController');
const createDriverRouter = require('./interfaces/routes/driverRoutes');

const TruckRepository = require('./infrastructure/repositories/TruckRepository');
const TruckService = require('./application/services/TruckService');
const TruckController = require('./interfaces/controllers/TruckController');
const createTruckRouter = require('./interfaces/routes/truckRoutes');

const InspectionRequestRepository = require('./infrastructure/repositories/InspectionRequestRepository');
const InspectionRequestService = require('./application/services/InspectionRequestService');
const InspectionRequestController = require('./interfaces/controllers/InspectionRequestController');
const createInspectionRequestRouter = require('./interfaces/routes/inspectionRequestRoutes');

// Inicializar banco de dados
async function startServer() {
  try {
    const db = await initializeDatabase();
    global.db = db;

    // Criar diretórios necessários
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const dataDir = path.join(process.cwd(), 'data');
    const inspectionsDir = path.join(uploadsDir, 'inspections');

    // Verificar se os diretórios existem, criar se necessário
    [uploadsDir, dataDir, inspectionsDir].forEach(dir => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Directory created: ${dir}`);
        }
      } catch (error) {
        console.error(`Error checking/creating directory ${dir}:`, error);
        process.exit(1);
      }
    });

    const app = express();

    // Middleware
    app.use(cors());
    // Aumentar limite de tamanho para uploads
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Servir arquivos estáticos
    app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads'), {
      setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-cache');
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }
      }
    }));

    // Dependency Injection
    const driverRepository = new DriverRepository();
    const driverService = new DriverService(driverRepository);
    const driverController = new DriverController(driverService);

    const truckRepository = new TruckRepository();
    const truckService = new TruckService(truckRepository);
    const truckController = new TruckController(truckService);

    const inspectionRequestRepository = new InspectionRequestRepository();
    const inspectionRequestService = new InspectionRequestService(
      inspectionRequestRepository,
      truckRepository,
      driverRepository
    );
    const inspectionRequestController = new InspectionRequestController(inspectionRequestService);

    // Rota de healthcheck
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Rotas da API
    app.use('/api', createDriverRouter(driverController));
    app.use('/api', createTruckRouter(truckController));
    app.use('/api', createInspectionRequestRouter(inspectionRequestController));

    // Tratamento de erros
    app.use((err, req, res, next) => {
      console.error('Erro na aplicação:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor'
      });
    });

    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Iniciando desligamento gracioso...');
      server.close(() => {
        console.log('Servidor HTTP fechado');
        if (db) {
          db.close((err) => {
            if (err) {
              console.error('Erro ao fechar banco de dados:', err);
              process.exit(1);
            }
            console.log('Conexão com banco de dados fechada');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });

      // Forçar fechamento após 10 segundos
      setTimeout(() => {
        console.error('Não foi possível fechar as conexões em 10s, forçando saída');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

startServer(); 