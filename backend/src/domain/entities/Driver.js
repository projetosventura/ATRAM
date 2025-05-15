class Driver {
  constructor({
    id = null,
    name,
    cnh,
    cnhExpirationDate,
    vehicleType,
    photo = null,
    created_at = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.cnh = cnh;
    this.cnhExpirationDate = cnhExpirationDate;
    this.vehicleType = vehicleType;
    this.photo = photo;
    this.created_at = created_at;
  }

  validate() {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Nome do motorista deve ter pelo menos 3 caracteres');
    }
    if (!this.cnh || !/^\d{11}$/.test(this.cnh)) {
      throw new Error('CNH deve conter 11 dígitos');
    }
    if (!this.cnhExpirationDate || new Date(this.cnhExpirationDate) < new Date()) {
      throw new Error('Data de validade da CNH deve ser uma data futura');
    }
    if (!this.vehicleType) {
      throw new Error('Tipo de veículo é obrigatório');
    }
  }
}

module.exports = Driver; 