class Truck {
  constructor({
    id = null,
    plate,
    chassis,
    model,
    brand,
    year,
    type,
    vehicle_category, // 'cavalo', 'carreta', 'dolly'
    capacity,
    photo = null,
    created_at = new Date()
  }) {
    this.id = id;
    this.plate = plate;
    this.chassis = chassis;
    this.model = model;
    this.brand = brand;
    this.year = year;
    this.type = type; // tipo antigo: Caminhão Baú, Carreta, etc.
    this.vehicle_category = vehicle_category; // nova categoria: cavalo, carreta ou dolly
    this.capacity = capacity;
    this.photo = photo;
    this.created_at = created_at;
  }

  validate() {
    if (!this.plate || !/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/.test(this.plate)) {
      throw new Error('Placa inválida. Use o formato: ABC1234 ou ABC1D23');
    }
    if (!this.chassis || this.chassis.length !== 17) {
      throw new Error('Número do chassi deve ter 17 caracteres');
    }
    if (!this.model || this.model.trim().length < 2) {
      throw new Error('Modelo é obrigatório');
    }
    if (!this.brand || this.brand.trim().length < 2) {
      throw new Error('Marca é obrigatória');
    }
    if (!this.year || this.year < 1950 || this.year > new Date().getFullYear() + 1) {
      throw new Error('Ano inválido');
    }
    if (!this.type) {
      throw new Error('Tipo de caminhão é obrigatório');
    }
    if (!this.vehicle_category || !['cavalo', 'carreta', 'dolly'].includes(this.vehicle_category)) {
      throw new Error('Categoria do veículo é obrigatória (cavalo, carreta ou dolly)');
    }
    if (!this.capacity || this.capacity <= 0) {
      throw new Error('Capacidade deve ser maior que zero');
    }
  }

  // Método para verificar se é um cavalo mecânico
  isCavalo() {
    return this.vehicle_category === 'cavalo';
  }

  // Método para verificar se é uma carreta
  isCarreta() {
    return this.vehicle_category === 'carreta';
  }

  // Método para verificar se é um dolly
  isDolly() {
    return this.vehicle_category === 'dolly';
  }

  // Método para obter descrição da categoria
  getCategoryDescription() {
    const descriptions = {
      'cavalo': 'Cavalo Mecânico',
      'carreta': 'Carreta/Reboque',
      'dolly': 'Dolly (Implemento Rodoviário)'
    };
    return descriptions[this.vehicle_category] || this.vehicle_category;
  }
}

module.exports = Truck; 