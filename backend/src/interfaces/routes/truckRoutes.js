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

function createTruckRouter(truckController) {
  const router = express.Router();

  // Listar todos os caminhões
  router.get('/trucks', async (req, res) => {
    try {
      const trucks = await truckController.getTrucks(req.query);
      res.json(trucks);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar caminhão por ID
  router.get('/trucks/:id', async (req, res) => {
    try {
      const truck = await truckController.getTruck(req.params.id);
      res.json(truck);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Criar novo caminhão
  router.post('/trucks', upload.single('photo'), async (req, res) => {
    try {
      const truckData = {
        plate: req.body.plate?.toUpperCase().trim(),
        chassis: req.body.chassis?.toUpperCase().trim(),
        model: req.body.model?.trim(),
        brand: req.body.brand?.trim(),
        year: parseInt(req.body.year),
        type: req.body.type?.trim(),
        vehicle_category: req.body.vehicle_category?.trim(),
        photo: req.file ? `/api/uploads/${req.file.filename}` : null
      };

      const truck = await truckController.createTruck(truckData);
      res.status(201).json(truck);
    } catch (error) {
      console.error('Erro ao criar caminhão:', error);
      res.status(error.status || 400).json({ error: error.message });
    }
  });

  // Atualizar caminhão
  router.put('/trucks/:id', upload.single('photo'), async (req, res) => {
    try {
      const truckData = {
        plate: req.body.plate?.toUpperCase().trim(),
        chassis: req.body.chassis?.toUpperCase().trim(),
        model: req.body.model?.trim(),
        brand: req.body.brand?.trim(),
        year: parseInt(req.body.year),
        type: req.body.type?.trim(),
        vehicle_category: req.body.vehicle_category?.trim(),
        photo: req.file ? `/api/uploads/${req.file.filename}` : undefined
      };

      const truck = await truckController.updateTruck(req.params.id, truckData);
      res.json(truck);
    } catch (error) {
      console.error('Erro ao atualizar caminhão:', error);
      res.status(error.status || 400).json({ error: error.message });
    }
  });

  // Excluir caminhão
  router.delete('/trucks/:id', async (req, res) => {
    try {
      await truckController.deleteTruck(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createTruckRouter; 