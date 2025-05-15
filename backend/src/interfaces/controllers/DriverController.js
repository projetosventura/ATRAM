class DriverController {
  constructor(driverService) {
    this.driverService = driverService;
  }

  async create(driverData) {
    try {
      const driver = await this.driverService.createDriver(driverData);
      return driver;
    } catch (error) {
      throw error;
    }
  }

  async update(id, driverData) {
    try {
      const driver = await this.driverService.updateDriver(id, driverData);
      return driver;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.driverService.deleteDriver(id);
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const driver = await this.driverService.getDriver(id);
      return driver;
    } catch (error) {
      throw error;
    }
  }

  async search(filters) {
    try {
      const drivers = await this.driverService.searchDrivers(filters);
      return drivers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DriverController; 