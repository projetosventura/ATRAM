const Driver = require('../../domain/entities/Driver');

class DriverService {
  constructor(driverRepository) {
    this.driverRepository = driverRepository;
  }

  async createDriver(driverData) {
    const driver = new Driver(driverData);
    driver.validate();
    return await this.driverRepository.create(driver);
  }

  async updateDriver(id, driverData) {
    const existingDriver = await this.driverRepository.findById(id);
    if (!existingDriver) {
      throw new Error('Motorista não encontrado');
    }

    const updatedDriver = new Driver({ ...existingDriver, ...driverData });
    updatedDriver.validate();
    return await this.driverRepository.update(id, updatedDriver);
  }

  async deleteDriver(id) {
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new Error('Motorista não encontrado');
    }
    await this.driverRepository.delete(id);
  }

  async getDriver(id) {
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new Error('Motorista não encontrado');
    }
    return driver;
  }

  async searchDrivers(filters) {
    return await this.driverRepository.findAll(filters);
  }
}

module.exports = DriverService; 