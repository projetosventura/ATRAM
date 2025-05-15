const InspectionRequest = require('../../domain/entities/InspectionRequest');

class InspectionRequestService {
  constructor(inspectionRequestRepository, truckRepository, driverRepository) {
    this.inspectionRequestRepository = inspectionRequestRepository;
    this.truckRepository = truckRepository;
    this.driverRepository = driverRepository;
  }

  async createRequest(data) {
    // Verificar se o caminhão existe
    const truck = await this.truckRepository.findById(data.truck_id);
    if (!truck) {
      throw new Error('Caminhão não encontrado');
    }

    // Verificar se o motorista existe
    const driver = await this.driverRepository.findById(data.driver_id);
    if (!driver) {
      throw new Error('Motorista não encontrado');
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

    const truck = await this.truckRepository.findById(request.truck_id);
    
    const updatedRequest = new InspectionRequest({
      ...request,
      ...data,
      inspection_date: new Date(),
      status: 'pending'
    });

    updatedRequest.validate();
    
    const savedRequest = await this.inspectionRequestRepository.update(request.id, updatedRequest);

    if (photos && photos.length > 0) {
      const photoPaths = await this.inspectionRequestRepository.savePhotos(request.id, photos, truck.plate);
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