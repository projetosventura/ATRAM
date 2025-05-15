const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

function createDriverRouter(driverController) {
  const router = express.Router();

  router.post('/drivers', upload.single('photo'), async (req, res) => {
    try {
      const driverData = {
        name: req.body.name.trim(),
        cnh: req.body.cnh.replace(/\D/g, ''),
        cnhExpirationDate: req.body.cnhExpirationDate,
        vehicleType: req.body.vehicleType,
        photo: req.file ? `/api/uploads/${req.file.filename}` : null
      };

      const driver = await driverController.create(driverData);
      res.status(201).json(driver);
    } catch (error) {
      console.error('Erro ao criar motorista:', error);
      res.status(error.status || 400).json({ error: error.message });
    }
  });

  router.put('/drivers/:id', upload.single('photo'), async (req, res) => {
    try {
      const driverData = {
        name: req.body.name?.trim(),
        cnh: req.body.cnh?.replace(/\D/g, ''),
        cnhExpirationDate: req.body.cnhExpirationDate,
        vehicleType: req.body.vehicleType,
        photo: req.file ? `/api/uploads/${req.file.filename}` : undefined
      };

      const driver = await driverController.update(req.params.id, driverData);
      res.json(driver);
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      res.status(error.status || 400).json({ error: error.message });
    }
  });

  router.delete('/drivers/:id', async (req, res) => {
    try {
      await driverController.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      res.status(error.status || 400).json({ error: error.message });
    }
  });

  router.get('/drivers/:id', async (req, res) => {
    try {
      const driver = await driverController.getById(req.params.id);
      res.json(driver);
    } catch (error) {
      console.error('Erro ao buscar motorista:', error);
      res.status(error.status || 404).json({ error: error.message });
    }
  });

  router.get('/drivers', async (req, res) => {
    try {
      const drivers = await driverController.search(req.query);
      res.json(drivers);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      res.status(error.status || 400).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createDriverRouter; 