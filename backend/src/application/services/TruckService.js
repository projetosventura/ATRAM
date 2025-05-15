const Truck = require('../../domain/entities/Truck');

class TruckService {
  constructor(truckRepository) {
    this.truckRepository = truckRepository;
  }

  async createTruck(truckData) {
    const truck = new Truck(truckData);
    truck.validate();

    // Verificar se já existe caminhão com a mesma placa
    const existingTruckByPlate = await this.truckRepository.findByPlate(truck.plate);
    if (existingTruckByPlate) {
      throw new Error('Já existe um caminhão cadastrado com esta placa');
    }

    // Verificar se já existe caminhão com o mesmo chassi
    const existingTruckByChassis = await this.truckRepository.findByChassis(truck.chassis);
    if (existingTruckByChassis) {
      throw new Error('Já existe um caminhão cadastrado com este chassi');
    }

    return await this.truckRepository.create(truck);
  }

  async updateTruck(id, truckData) {
    const existingTruck = await this.truckRepository.findById(id);
    if (!existingTruck) {
      throw new Error('Caminhão não encontrado');
    }

    // Verificar se a placa já está em uso por outro caminhão
    if (truckData.plate && truckData.plate !== existingTruck.plate) {
      const truckWithPlate = await this.truckRepository.findByPlate(truckData.plate);
      if (truckWithPlate && truckWithPlate.id !== id) {
        throw new Error('Já existe um caminhão cadastrado com esta placa');
      }
    }

    // Verificar se o chassi já está em uso por outro caminhão
    if (truckData.chassis && truckData.chassis !== existingTruck.chassis) {
      const truckWithChassis = await this.truckRepository.findByChassis(truckData.chassis);
      if (truckWithChassis && truckWithChassis.id !== id) {
        throw new Error('Já existe um caminhão cadastrado com este chassi');
      }
    }

    const updatedTruck = new Truck({
      ...existingTruck,
      ...truckData,
      id
    });
    updatedTruck.validate();

    return await this.truckRepository.update(id, updatedTruck);
  }

  async deleteTruck(id) {
    const truck = await this.truckRepository.findById(id);
    if (!truck) {
      throw new Error('Caminhão não encontrado');
    }
    await this.truckRepository.delete(id);
  }

  async getTruck(id) {
    const truck = await this.truckRepository.findById(id);
    if (!truck) {
      throw new Error('Caminhão não encontrado');
    }
    return truck;
  }

  async searchTrucks(filters) {
    return await this.truckRepository.findAll(filters);
  }

  async getTruckByPlate(plate) {
    const truck = await this.truckRepository.findByPlate(plate);
    if (!truck) {
      throw new Error('Caminhão não encontrado');
    }
    return truck;
  }

  async getTruckByChassis(chassis) {
    const truck = await this.truckRepository.findByChassis(chassis);
    if (!truck) {
      throw new Error('Caminhão não encontrado');
    }
    return truck;
  }
}

module.exports = TruckService; 