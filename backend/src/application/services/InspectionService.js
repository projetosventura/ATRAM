const Inspection = require('../../domain/entities/Inspection');
const path = require('path');
const fs = require('fs').promises;

class InspectionService {
  constructor(inspectionRepository, truckRepository, driverRepository) {
    this.inspectionRepository = inspectionRepository;
    this.truckRepository = truckRepository;
    this.driverRepository = driverRepository;
  }

  async createInspection(inspectionData, photos) {
    // Verificar se o caminhão existe
    const truck = await this.truckRepository.findById(inspectionData.truck_id);
    if (!truck) {
      throw new Error('Caminhão não encontrado');
    }

    // Verificar se o motorista existe
    const driver = await this.driverRepository.findById(inspectionData.driver_id);
    if (!driver) {
      throw new Error('Motorista não encontrado');
    }

    // Processar e salvar as fotos
    const processedPhotos = await this.processPhotos(photos);
    const inspection = new Inspection({
      ...inspectionData,
      photos: processedPhotos
    });

    inspection.validate();
    return await this.inspectionRepository.create(inspection);
  }

  async updateInspection(id, inspectionData, newPhotos) {
    const existingInspection = await this.inspectionRepository.findById(id);
    if (!existingInspection) {
      throw new Error('Vistoria não encontrada');
    }

    // Verificar se o caminhão existe
    if (inspectionData.truck_id) {
      const truck = await this.truckRepository.findById(inspectionData.truck_id);
      if (!truck) {
        throw new Error('Caminhão não encontrado');
      }
    }

    // Verificar se o motorista existe
    if (inspectionData.driver_id) {
      const driver = await this.driverRepository.findById(inspectionData.driver_id);
      if (!driver) {
        throw new Error('Motorista não encontrado');
      }
    }

    // Processar novas fotos se houverem
    let processedPhotos = existingInspection.photos;
    if (newPhotos && newPhotos.length > 0) {
      processedPhotos = await this.processPhotos(newPhotos);
    }

    const updatedInspection = new Inspection({
      ...existingInspection,
      ...inspectionData,
      photos: processedPhotos
    });

    updatedInspection.validate();
    return await this.inspectionRepository.update(id, updatedInspection);
  }

  async deleteInspection(id) {
    const inspection = await this.inspectionRepository.findById(id);
    if (!inspection) {
      throw new Error('Vistoria não encontrada');
    }

    // Remover arquivos de fotos
    for (const photo of inspection.photos) {
      try {
        await fs.unlink(path.join(process.cwd(), photo.path));
      } catch (error) {
        console.error(`Erro ao remover arquivo: ${photo.path}`, error);
      }
    }

    await this.inspectionRepository.delete(id);
  }

  async getInspection(id) {
    const inspection = await this.inspectionRepository.findById(id);
    if (!inspection) {
      throw new Error('Vistoria não encontrada');
    }
    return inspection;
  }

  async searchInspections(filters) {
    return await this.inspectionRepository.findAll(filters);
  }

  async processPhotos(photos) {
    const processedPhotos = [];
    const uploadDir = path.join(process.cwd(), 'uploads', 'inspections');

    // Garantir que o diretório existe
    await fs.mkdir(uploadDir, { recursive: true });

    for (const photo of photos) {
      const timestamp = Date.now();
      const filename = `inspection_${timestamp}_${photo.originalname}`;
      const filepath = path.join('uploads', 'inspections', filename);
      
      await fs.writeFile(
        path.join(process.cwd(), filepath),
        photo.buffer
      );

      processedPhotos.push({
        path: filepath,
        description: photo.description || ''
      });
    }

    return processedPhotos;
  }

  async getInspectionsByTruck(truckId, startDate, endDate) {
    const filters = {
      truck_id: truckId
    };

    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    return await this.inspectionRepository.findAll(filters);
  }

  async getInspectionsByDriver(driverId, startDate, endDate) {
    const filters = {
      driver_id: driverId
    };

    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    return await this.inspectionRepository.findAll(filters);
  }

  async getPendingInspections() {
    return await this.inspectionRepository.findAll({ status: 'pending' });
  }

  async getExpiredInspections() {
    const today = new Date();
    const inspections = await this.inspectionRepository.findAll();
    return inspections.filter(inspection => 
      new Date(inspection.next_inspection_date) < today
    );
  }
}

module.exports = InspectionService; 