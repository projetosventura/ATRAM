class TruckController {
  constructor(truckService) {
    this.truckService = truckService;
  }

  async getTrucks(filters) {
    try {
      return await this.truckService.searchTrucks(filters);
    } catch (error) {
      console.error('Erro ao buscar caminhões:', error);
      throw error;
    }
  }

  async getTruck(id) {
    try {
      return await this.truckService.getTruck(id);
    } catch (error) {
      console.error('Erro ao buscar caminhão:', error);
      throw error;
    }
  }

  async createTruck(truckData) {
    try {
      // Converter campos numéricos
      if (truckData.year) truckData.year = parseInt(truckData.year);

      return await this.truckService.createTruck(truckData);
    } catch (error) {
      console.error('Erro ao criar caminhão:', error);
      throw error;
    }
  }

  async updateTruck(id, truckData) {
    try {
      // Converter campos numéricos
      if (truckData.year) truckData.year = parseInt(truckData.year);

      return await this.truckService.updateTruck(id, truckData);
    } catch (error) {
      console.error('Erro ao atualizar caminhão:', error);
      throw error;
    }
  }

  async deleteTruck(id) {
    try {
      await this.truckService.deleteTruck(id);
    } catch (error) {
      console.error('Erro ao excluir caminhão:', error);
      throw error;
    }
  }
}

module.exports = TruckController; 