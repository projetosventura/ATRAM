const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Máximo de 10 fotos por vistoria
  }
});

function createInspectionRequestRouter(inspectionRequestController) {
  const router = express.Router();

  // Criar nova solicitação de vistoria
  router.post('/inspection-requests', async (req, res) => {
    try {
      const request = await inspectionRequestController.createRequest(req.body);
      res.status(201).json({
        message: 'Solicitação de vistoria criada com sucesso',
        request,
        inspectionUrl: `/inspection/${request.token}`
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar solicitação de vistoria por token (rota pública)
  router.get('/inspection-requests/:token', async (req, res) => {
    try {
      const request = await inspectionRequestController.getRequest(req.params.token);
      res.json(request);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Submeter vistoria (rota pública)
  router.post('/inspection-requests/:token/submit', upload.array('photos', 10), async (req, res) => {
    try {
      const request = await inspectionRequestController.submitInspection(
        req.params.token,
        req.body,
        req.files
      );
      res.json({
        message: 'Vistoria submetida com sucesso',
        request
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Listar todas as solicitações de vistoria
  router.get('/inspection-requests', async (req, res) => {
    try {
      const requests = await inspectionRequestController.listRequests(req.query);
      res.json(requests);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Atualizar status da vistoria (aprovar/rejeitar)
  router.patch('/inspection-requests/:id/status', async (req, res) => {
    try {
      const request = await inspectionRequestController.updateStatus(
        req.params.id,
        req.body.status
      );
      res.json({
        message: 'Status da vistoria atualizado com sucesso',
        request
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Buscar fotos de uma vistoria
  router.get('/inspection-requests/:id/photos', async (req, res) => {
    try {
      const photos = await inspectionRequestController.getPhotos(req.params.id);
      res.json(photos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createInspectionRequestRouter; 