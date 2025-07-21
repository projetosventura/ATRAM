class VehicleSet {
  constructor({
    id = null,
    name,
    type, // 'cavalo', 'carreta', 'conjugado', 'bitrem'
    cavalo_id = null,
    carreta_id = null,
    dolly_id = null,
    description = null,
    created_at = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.cavalo_id = cavalo_id;
    this.carreta_id = carreta_id;
    this.dolly_id = dolly_id;
    this.description = description;
    this.created_at = created_at;
  }

  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Nome do conjunto é obrigatório');
    }
    
    if (!['cavalo', 'carreta', 'conjugado', 'bitrem'].includes(this.type)) {
      throw new Error('Tipo de conjunto inválido. Use: cavalo, carreta, conjugado ou bitrem');
    }

    // Validações específicas por tipo
    if (this.type === 'cavalo') {
      if (!this.cavalo_id) {
        throw new Error('ID do cavalo é obrigatório para conjuntos do tipo cavalo');
      }
      if (this.carreta_id || this.dolly_id) {
        throw new Error('Conjunto do tipo cavalo não deve ter carreta ou dolly associado');
      }
    }

    if (this.type === 'carreta') {
      if (!this.carreta_id) {
        throw new Error('ID da carreta é obrigatório para conjuntos do tipo carreta');
      }
      if (this.cavalo_id || this.dolly_id) {
        throw new Error('Conjunto do tipo carreta não deve ter cavalo ou dolly associado');
      }
    }

    if (this.type === 'conjugado') {
      if (!this.cavalo_id || !this.carreta_id) {
        throw new Error('Conjuntos conjugados devem ter tanto cavalo quanto carreta');
      }
      if (this.dolly_id) {
        throw new Error('Conjunto conjugado simples não deve ter dolly (use tipo bitrem)');
      }
    }

    if (this.type === 'bitrem') {
      if (!this.cavalo_id || !this.carreta_id || !this.dolly_id) {
        throw new Error('Conjuntos bitrem devem ter cavalo, carreta e dolly');
      }
    }
  }

  // Método para verificar se o conjunto está completo
  isComplete() {
    if (this.type === 'cavalo') return !!this.cavalo_id;
    if (this.type === 'carreta') return !!this.carreta_id;
    if (this.type === 'conjugado') return !!(this.cavalo_id && this.carreta_id);
    if (this.type === 'bitrem') return !!(this.cavalo_id && this.carreta_id && this.dolly_id);
    return false;
  }

  // Método para obter IDs dos veículos do conjunto
  getVehicleIds() {
    const ids = [];
    if (this.cavalo_id) ids.push(this.cavalo_id);
    if (this.carreta_id) ids.push(this.carreta_id);
    if (this.dolly_id) ids.push(this.dolly_id);
    return ids;
  }

  // Método para obter descrição do tipo
  getTypeDescription() {
    const descriptions = {
      'cavalo': 'Cavalo Mecânico',
      'carreta': 'Carreta/Reboque',
      'conjugado': 'Conjunto Conjugado (Cavalo + Carreta)',
      'bitrem': 'Bitrem (Cavalo + Carreta + Dolly)'
    };
    return descriptions[this.type] || this.type;
  }

  // Método para verificar se é um bitrem
  isBitrem() {
    return this.type === 'bitrem';
  }

  // Método para obter a capacidade total do conjunto
  getTotalCapacity(vehicles = {}) {
    let totalCapacity = 0;
    
    if (this.cavalo_id && vehicles.cavalo) {
      totalCapacity += vehicles.cavalo.capacity || 0;
    }
    if (this.carreta_id && vehicles.carreta) {
      totalCapacity += vehicles.carreta.capacity || 0;
    }
    if (this.dolly_id && vehicles.dolly) {
      totalCapacity += vehicles.dolly.capacity || 0;
    }
    
    return totalCapacity;
  }
}

module.exports = VehicleSet; 