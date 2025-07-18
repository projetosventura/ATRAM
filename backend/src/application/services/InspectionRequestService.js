const InspectionRequest = require('../../domain/entities/InspectionRequest');

class InspectionRequestService {
  constructor(inspectionRequestRepository, truckRepository, driverRepository, vehicleSetRepository = null) {
    this.inspectionRequestRepository = inspectionRequestRepository;
    this.truckRepository = truckRepository;
    this.driverRepository = driverRepository;
    this.vehicleSetRepository = vehicleSetRepository;
  }

  async createRequest(data) {
    // Verificar se o motorista existe
    const driver = await this.driverRepository.findById(data.driver_id);
    if (!driver) {
      throw new Error('Motorista não encontrado');
    }

    // Verificar se foi fornecido conjunto de veículos ou caminhão individual
    if (data.vehicle_set_id) {
      // Verificar se o conjunto de veículos existe
      if (!this.vehicleSetRepository) {
        throw new Error('VehicleSetRepository não está disponível');
      }
      const vehicleSet = await this.vehicleSetRepository.findById(data.vehicle_set_id);
      if (!vehicleSet) {
        throw new Error('Conjunto de veículos não encontrado');
      }
    } else if (data.truck_id) {
      // Verificar se o caminhão existe (para compatibilidade com versão anterior)
      const truck = await this.truckRepository.findById(data.truck_id);
      if (!truck) {
        throw new Error('Caminhão não encontrado');
      }
    } else {
      throw new Error('É necessário fornecer um conjunto de veículos ou um caminhão');
    }

    const inspectionRequest = new InspectionRequest({
      ...data,
      status: 'pending'
    });

    inspectionRequest.validate();
    return await this.inspectionRequestRepository.create(inspectionRequest);
  }

  async findByToken(token) {
    const request = await this.inspectionRequestRepository.findByToken(token);
    if (!request) {
      throw new Error('Solicitação de vistoria não encontrada');
    }
    return request;
  }

  async submitInspection(token, data, photos) {
    const request = await this.inspectionRequestRepository.findByToken(token);
    if (!request) {
      throw new Error('Solicitação de vistoria não encontrada');
    }

    if (request.inspection_date) {
      throw new Error('Esta vistoria já foi preenchida');
    }

    // Determinar a placa do veículo para salvar as fotos
    let vehiclePlate = null;
    
    if (request.vehicle_set_id) {
      // É um conjunto de veículos
      const vehicleSet = await this.vehicleSetRepository.findById(request.vehicle_set_id);
      if (!vehicleSet) {
        throw new Error('Conjunto de veículos não encontrado');
      }
      
      // Usar a placa do cavalo se disponível, senão da carreta
      if (vehicleSet.cavalo_id) {
        const cavalo = await this.truckRepository.findById(vehicleSet.cavalo_id);
        vehiclePlate = cavalo.plate;
      } else if (vehicleSet.carreta_id) {
        const carreta = await this.truckRepository.findById(vehicleSet.carreta_id);
        vehiclePlate = carreta.plate;
      } else {
        throw new Error('Conjunto de veículos sem veículos válidos');
      }
    } else if (request.truck_id) {
      // É um caminhão individual
      const truck = await this.truckRepository.findById(request.truck_id);
      if (!truck) {
        throw new Error('Caminhão não encontrado');
      }
      vehiclePlate = truck.plate;
    } else {
      throw new Error('Solicitação de vistoria sem veículo associado');
    }
    
    const updatedRequest = new InspectionRequest({
      ...request,
      ...data,
      inspection_date: new Date(),
      status: 'pending'
    });

    updatedRequest.validate();
    
    const savedRequest = await this.inspectionRequestRepository.update(request.id, updatedRequest);

    if (photos && photos.length > 0) {
      const photoPaths = await this.inspectionRequestRepository.savePhotos(request.id, photos, vehiclePlate);
      savedRequest.photos = photoPaths;
    }

    return savedRequest;
  }

  async updateStatus(id, status) {
    const request = await this.inspectionRequestRepository.findById(id);
    if (!request) {
      throw new Error('Solicitação de vistoria não encontrada');
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Status inválido');
    }

    const updatedRequest = new InspectionRequest({
      ...request,
      status
    });

    return await this.inspectionRequestRepository.update(id, updatedRequest);
  }

  async listRequests(filters = {}) {
    return await this.inspectionRequestRepository.findAll(filters);
  }

  async getPhotos(inspectionId) {
    return await this.inspectionRequestRepository.getPhotos(inspectionId);
  }
}

module.exports = InspectionRequestService; 