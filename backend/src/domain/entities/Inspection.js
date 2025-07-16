class Inspection {
  constructor({
    id = null,
    truck_id,
    driver_id,
    inspection_date = new Date(),
    mileage,
    fuel_level,
    brake_condition,
    general_condition,
    observations,
    photos = [],
    next_inspection_date,
    status = 'pending',
    created_at = new Date()
  }) {
    this.id = id;
    this.truck_id = truck_id;
    this.driver_id = driver_id;
    this.inspection_date = inspection_date;
    this.mileage = mileage;
    this.fuel_level = fuel_level;
    this.brake_condition = brake_condition;
    this.general_condition = general_condition;
    this.observations = observations;
    this.photos = photos;
    this.next_inspection_date = next_inspection_date;
    this.status = status;
    this.created_at = created_at;
  }

  validate() {
    if (!this.truck_id) {
      throw new Error('Caminhão é obrigatório');
    }
    if (!this.driver_id) {
      throw new Error('Motorista é obrigatório');
    }
    if (!this.inspection_date) {
      throw new Error('Data da vistoria é obrigatória');
    }
    if (!this.mileage || this.mileage < 0) {
      throw new Error('Quilometragem deve ser maior ou igual a zero');
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
    if (!this.next_inspection_date || new Date(this.next_inspection_date) <= new Date()) {
      throw new Error('Data da próxima vistoria deve ser uma data futura');
    }
    if (!['pending', 'approved', 'rejected'].includes(this.status)) {
      throw new Error('Status inválido');
    }
  }
}

module.exports = Inspection; 