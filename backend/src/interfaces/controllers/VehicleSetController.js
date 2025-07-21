class VehicleSetController {
  constructor(vehicleSetService) {
    this.vehicleSetService = vehicleSetService;
  }

  async getVehicleSets(filters) {
    try {
      return await this.vehicleSetService.searchVehicleSets(filters);
    } catch (error) {
      console.error('Erro ao buscar conjuntos de veículos:', error);
      throw error;
    }
  }

  async getVehicleSet(id) {
    try {
      return await this.vehicleSetService.getVehicleSetWithDetails(id);
    } catch (error) {
      console.error('Erro ao buscar conjunto de veículos:', error);
      throw error;
    }
  }

  async createVehicleSet(vehicleSetData) {
    try {
      return await this.vehicleSetService.createVehicleSet(vehicleSetData);
    } catch (error) {
      console.error('Erro ao criar conjunto de veículos:', error);
      throw error;
    }
  }

  async updateVehicleSet(id, vehicleSetData) {
    try {
      return await this.vehicleSetService.updateVehicleSet(id, vehicleSetData);
    } catch (error) {
      console.error('Erro ao atualizar conjunto de veículos:', error);
      throw error;
    }
  }

  async deleteVehicleSet(id) {
    try {
      await this.vehicleSetService.deleteVehicleSet(id);
    } catch (error) {
      console.error('Erro ao excluir conjunto de veículos:', error);
      throw error;
    }
  }

  async getAvailableCavalos(excludeSetId) {
    try {
      return await this.vehicleSetService.getAvailableCavalos(excludeSetId);
    } catch (error) {
      console.error('Erro ao buscar cavalos disponíveis:', error);
      throw error;
    }
  }

  async getAvailableCarretas(excludeSetId) {
    try {
      return await this.vehicleSetService.getAvailableCarretas(excludeSetId);
    } catch (error) {
      console.error('Erro ao buscar carretas disponíveis:', error);
      throw error;
    }
  }

  async getAvailableDollies(excludeSetId) {
    try {
      return await this.vehicleSetService.getAvailableDollies(excludeSetId);
    } catch (error) {
      console.error('Erro ao buscar dollies disponíveis:', error);
      throw error;
    }
  }
}

module.exports = VehicleSetController; 