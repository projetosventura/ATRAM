class InspectionRequest {
  constructor({
    id = null,
    truck_id = null,
    vehicle_set_id = null,
    driver_id,
    token = null,
    status = 'pending',
    inspection_date = null,
    mileage = null,
    fuel_level = null,
    brake_condition = null,
    general_condition = null,
    observations = null,
    photos = [],
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.id = id;
    this.truck_id = truck_id;
    this.vehicle_set_id = vehicle_set_id;
    this.driver_id = driver_id;
    this.token = token;
    this.status = status;
    this.inspection_date = inspection_date;
    this.mileage = mileage;
    this.fuel_level = fuel_level;
    this.brake_condition = brake_condition;
    this.general_condition = general_condition;
    this.observations = observations;
    this.photos = photos;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  validate() {
    if (!this.truck_id && !this.vehicle_set_id) {
      throw new Error('ID do caminhão ou conjunto de veículos é obrigatório');
    }
    if (!this.driver_id) {
      throw new Error('ID do motorista é obrigatório');
    }
    
    // Validações adicionais quando a vistoria for preenchida
    if (this.inspection_date) {
      if (!this.mileage || this.mileage <= 0) {
        throw new Error('Quilometragem deve ser maior que zero');
      }
      if (!this.fuel_level || this.fuel_level < 0 || this.fuel_level > 100) {
        throw new Error('Nível de combustível deve estar entre 0 e 100');
      }
      if (!this.brake_condition) {
        throw new Error('Condição dos freios é obrigatória');
      }
      if (!this.general_condition) {
        throw new Error('Condição geral é obrigatória');
      }
    }
  }
}

module.exports = InspectionRequest; 