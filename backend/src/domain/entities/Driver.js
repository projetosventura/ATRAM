class Driver {
  constructor({
    id = null,
    name,
    cpf,
    photo = null,
    created_at = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.photo = photo;
    this.created_at = created_at;
  }

  validate() {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Nome do motorista deve ter pelo menos 3 caracteres');
    }
    if (!this.cpf || !/^\d{11}$/.test(this.cpf)) {
      throw new Error('CPF deve conter 11 dígitos');
    }
  }
}

module.exports = Driver; 