class InspectionRequestController {
  constructor(inspectionRequestService) {
    this.inspectionRequestService = inspectionRequestService;
  }

  async createRequest(data) {
    try {
      return await this.inspectionRequestService.createRequest(data);
    } catch (error) {
      console.error('Erro ao criar solicitação de vistoria:', error);
      throw error;
    }
  }

  async getRequest(token) {
    try {
      return await this.inspectionRequestService.findByToken(token);
    } catch (error) {
      console.error('Erro ao buscar solicitação de vistoria:', error);
      throw error;
    }
  }

  async submitInspection(token, data, photos) {
    try {
      return await this.inspectionRequestService.submitInspection(token, data, photos);
    } catch (error) {
      console.error('Erro ao submeter vistoria:', error);
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      return await this.inspectionRequestService.updateStatus(id, status);
    } catch (error) {
      console.error('Erro ao atualizar status da vistoria:', error);
      throw error;
    }
  }

  async listRequests(filters) {
    try {
      return await this.inspectionRequestService.listRequests(filters);
    } catch (error) {
      console.error('Erro ao listar solicitações de vistoria:', error);
      throw error;
    }
  }

  async getPhotos(inspectionId) {
    try {
      return await this.inspectionRequestService.getPhotos(inspectionId);
    } catch (error) {
      console.error('Erro ao buscar fotos da vistoria:', error);
      throw error;
    }
  }
}

module.exports = InspectionRequestController; 