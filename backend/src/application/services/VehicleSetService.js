const VehicleSet = require('../../domain/entities/VehicleSet');

class VehicleSetService {
  constructor(vehicleSetRepository, truckRepository) {
    this.vehicleSetRepository = vehicleSetRepository;
    this.truckRepository = truckRepository;
  }

  async createVehicleSet(vehicleSetData) {
    const vehicleSet = new VehicleSet(vehicleSetData);
    vehicleSet.validate();

    // Validações específicas
    await this.validateVehicleSet(vehicleSet);

    return await this.vehicleSetRepository.create(vehicleSet);
  }

  async updateVehicleSet(id, vehicleSetData) {
    const existingVehicleSet = await this.vehicleSetRepository.findById(id);
    if (!existingVehicleSet) {
      throw new Error('Conjunto de veículos não encontrado');
    }

    const updatedVehicleSet = new VehicleSet({
      ...existingVehicleSet,
      ...vehicleSetData
    });
    
    updatedVehicleSet.validate();
    await this.validateVehicleSet(updatedVehicleSet, id);

    return await this.vehicleSetRepository.update(id, updatedVehicleSet);
  }

  async deleteVehicleSet(id) {
    const vehicleSet = await this.vehicleSetRepository.findById(id);
    if (!vehicleSet) {
      throw new Error('Conjunto de veículos não encontrado');
    }

    // Verificar se o conjunto está sendo usado em alguma inspeção
    // TODO: Implementar verificação de uso em inspeções

    await this.vehicleSetRepository.delete(id);
  }

  async getVehicleSet(id) {
    const vehicleSet = await this.vehicleSetRepository.findById(id);
    if (!vehicleSet) {
      throw new Error('Conjunto de veículos não encontrado');
    }
    return vehicleSet;
  }

  async searchVehicleSets(filters = {}) {
    return await this.vehicleSetRepository.findAllWithVehicles(filters);
  }

  // Método para validar um conjunto de veículos
  async validateVehicleSet(vehicleSet, excludeSetId = null) {
    // Verificar se o cavalo existe e é da categoria correta
    if (vehicleSet.cavalo_id) {
      const cavalo = await this.truckRepository.findById(vehicleSet.cavalo_id);
      if (!cavalo) {
        throw new Error('Cavalo não encontrado');
      }
      if (cavalo.vehicle_category !== 'cavalo') {
        throw new Error('O veículo selecionado como cavalo deve ser da categoria "cavalo"');
      }

      // Verificar se o cavalo já está sendo usado em outro conjunto
      const cavaloInUse = await this.vehicleSetRepository.isVehicleInUse(vehicleSet.cavalo_id, excludeSetId);
      if (cavaloInUse) {
        throw new Error('Este cavalo já está sendo usado em outro conjunto');
      }
    }

    // Verificar se a carreta existe e é da categoria correta
    if (vehicleSet.carreta_id) {
      const carreta = await this.truckRepository.findById(vehicleSet.carreta_id);
      if (!carreta) {
        throw new Error('Carreta não encontrada');
      }
      if (carreta.vehicle_category !== 'carreta') {
        throw new Error('O veículo selecionado como carreta deve ser da categoria "carreta"');
      }

      // Verificar se a carreta já está sendo usada em outro conjunto
      const carretaInUse = await this.vehicleSetRepository.isVehicleInUse(vehicleSet.carreta_id, excludeSetId);
      if (carretaInUse) {
        throw new Error('Esta carreta já está sendo usada em outro conjunto');
      }
    }

    // Verificar se o mesmo veículo não está sendo usado duas vezes
    if (vehicleSet.cavalo_id && vehicleSet.carreta_id && vehicleSet.cavalo_id === vehicleSet.carreta_id) {
      throw new Error('O mesmo veículo não pode ser usado como cavalo e carreta ao mesmo tempo');
    }
  }

  // Método para obter veículos disponíveis por categoria
  async getAvailableVehiclesByCategory(category, excludeSetId = null) {
    // Buscar todos os veículos da categoria
    const vehicles = await this.truckRepository.findAll({ vehicle_category: category });
    
    // Filtrar apenas os que não estão sendo usados em conjuntos
    const availableVehicles = [];
    for (const vehicle of vehicles) {
      const inUse = await this.vehicleSetRepository.isVehicleInUse(vehicle.id, excludeSetId);
      if (!inUse) {
        availableVehicles.push(vehicle);
      }
    }
    
    return availableVehicles;
  }

  // Método para obter todos os cavalos disponíveis
  async getAvailableCavalos(excludeSetId = null) {
    return await this.getAvailableVehiclesByCategory('cavalo', excludeSetId);
  }

  // Método para obter todas as carretas disponíveis
  async getAvailableCarretas(excludeSetId = null) {
    return await this.getAvailableVehiclesByCategory('carreta', excludeSetId);
  }

  // Método para obter informações completas de um conjunto
  async getVehicleSetWithDetails(id) {
    const vehicleSet = await this.vehicleSetRepository.findById(id);
    if (!vehicleSet) {
      throw new Error('Conjunto de veículos não encontrado');
    }

    // Buscar informações detalhadas dos veículos
    if (vehicleSet.cavalo_id) {
      vehicleSet.cavalo = await this.truckRepository.findById(vehicleSet.cavalo_id);
    }

    if (vehicleSet.carreta_id) {
      vehicleSet.carreta = await this.truckRepository.findById(vehicleSet.carreta_id);
    }

    return vehicleSet;
  }
}

module.exports = VehicleSetService; 