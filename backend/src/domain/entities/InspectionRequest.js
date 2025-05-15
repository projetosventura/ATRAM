class InspectionRequest {
  constructor({
    id = null,
    truck_id,
    driver_id,
    token = null,
    status = 'pending',
    inspection_date = null,
    mileage = null,
    fuel_level = null,
    tire_condition = null,
    brake_condition = null,
    oil_level = null,
    general_condition = null,
    observations = null,
    photos = [],
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.id = id;
    this.truck_id = truck_id;
    this.driver_id = driver_id;
    this.token = token;
    this.status = status;
    this.inspection_date = inspection_date;
    this.mileage = mileage;
    this.fuel_level = fuel_level;
    this.tire_condition = tire_condition;
    this.brake_condition = brake_condition;
    this.oil_level = oil_level;
    this.general_condition = general_condition;
    this.observations = observations;
    this.photos = photos;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  validate() {
    if (!this.truck_id) {
      throw new Error('ID do caminhão é obrigatório');
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
      if (!this.tire_condition) {
        throw new Error('Condição dos pneus é obrigatória');
      }
      if (!this.brake_condition) {
        throw new Error('Condição dos freios é obrigatória');
      }
      if (!this.oil_level) {
        throw new Error('Nível do óleo é obrigatório');
      }
      if (!this.general_condition) {
        throw new Error('Condição geral é obrigatória');
      }
    }
  }
}

module.exports = InspectionRequest; 