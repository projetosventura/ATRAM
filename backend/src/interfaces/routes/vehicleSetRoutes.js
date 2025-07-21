const express = require('express');

function createVehicleSetRouter(vehicleSetController) {
  const router = express.Router();

  // Listar todos os conjuntos de veículos
  router.get('/vehicle-sets', async (req, res) => {
    try {
      const vehicleSets = await vehicleSetController.getVehicleSets(req.query);
      res.json(vehicleSets);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar conjunto de veículos por ID
  router.get('/vehicle-sets/:id', async (req, res) => {
    try {
      const vehicleSet = await vehicleSetController.getVehicleSet(req.params.id);
      res.json(vehicleSet);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Criar novo conjunto de veículos
  router.post('/vehicle-sets', async (req, res) => {
    try {
      const vehicleSet = await vehicleSetController.createVehicleSet(req.body);
      res.status(201).json(vehicleSet);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Atualizar conjunto de veículos
  router.put('/vehicle-sets/:id', async (req, res) => {
    try {
      const vehicleSet = await vehicleSetController.updateVehicleSet(req.params.id, req.body);
      res.json(vehicleSet);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Excluir conjunto de veículos
  router.delete('/vehicle-sets/:id', async (req, res) => {
    try {
      await vehicleSetController.deleteVehicleSet(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar cavalos disponíveis
  router.get('/vehicle-sets/available/cavalos', async (req, res) => {
    try {
      const excludeSetId = req.query.excludeSetId || null;
      const cavalos = await vehicleSetController.getAvailableCavalos(excludeSetId);
      res.json(cavalos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar carretas disponíveis
  router.get('/vehicle-sets/available/carretas', async (req, res) => {
    try {
      const excludeSetId = req.query.excludeSetId || null;
      const carretas = await vehicleSetController.getAvailableCarretas(excludeSetId);
      res.json(carretas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar dollies disponíveis
  router.get('/vehicle-sets/available/dollies', async (req, res) => {
    try {
      const excludeSetId = req.query.excludeSetId || null;
      const dollies = await vehicleSetController.getAvailableDollies(excludeSetId);
      res.json(dollies);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createVehicleSetRouter; 