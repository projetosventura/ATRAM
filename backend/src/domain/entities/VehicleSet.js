class VehicleSet {
  constructor({
    id = null,
    name,
    type, // 'cavalo', 'carreta', 'conjugado'
    cavalo_id = null,
    carreta_id = null,
    description = null,
    created_at = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.cavalo_id = cavalo_id;
    this.carreta_id = carreta_id;
    this.description = description;
    this.created_at = created_at;
  }

  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Nome do conjunto é obrigatório');
    }
    
    if (!['cavalo', 'carreta', 'conjugado'].includes(this.type)) {
      throw new Error('Tipo de conjunto inválido. Use: cavalo, carreta ou conjugado');
    }

    // Validações específicas por tipo
    if (this.type === 'cavalo') {
      if (!this.cavalo_id) {
        throw new Error('ID do cavalo é obrigatório para conjuntos do tipo cavalo');
      }
      if (this.carreta_id) {
        throw new Error('Conjunto do tipo cavalo não deve ter carreta associada');
      }
    }

    if (this.type === 'carreta') {
      if (!this.carreta_id) {
        throw new Error('ID da carreta é obrigatório para conjuntos do tipo carreta');
      }
      if (this.cavalo_id) {
        throw new Error('Conjunto do tipo carreta não deve ter cavalo associado');
      }
    }

    if (this.type === 'conjugado') {
      if (!this.cavalo_id || !this.carreta_id) {
        throw new Error('Conjuntos conjugados devem ter tanto cavalo quanto carreta');
      }
    }
  }

  // Método para verificar se o conjunto está completo
  isComplete() {
    if (this.type === 'cavalo') return !!this.cavalo_id;
    if (this.type === 'carreta') return !!this.carreta_id;
    if (this.type === 'conjugado') return !!(this.cavalo_id && this.carreta_id);
    return false;
  }

  // Método para obter IDs dos veículos do conjunto
  getVehicleIds() {
    const ids = [];
    if (this.cavalo_id) ids.push(this.cavalo_id);
    if (this.carreta_id) ids.push(this.carreta_id);
    return ids;
  }

  // Método para obter descrição do tipo
  getTypeDescription() {
    const descriptions = {
      'cavalo': 'Cavalo Mecânico',
      'carreta': 'Carreta/Reboque',
      'conjugado': 'Conjunto Conjugado (Cavalo + Carreta)'
    };
    return descriptions[this.type] || this.type;
  }
}

module.exports = VehicleSet; 