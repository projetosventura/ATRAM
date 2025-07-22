const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Driver = require('../../domain/entities/Driver');

class DriverRepository {
  constructor(db = null) {
    if (db) {
      // Usar conexão compartilhada se fornecida
      this.db = db;
      console.log('DriverRepository usando conexão compartilhada');
      // Não chamar createTable aqui para evitar conflitos com a inicialização principal
    } else {
      // Fallback para conexão própria
      const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          throw err;
        } else {
          console.log('Connected to SQLite database at:', dbPath);
          this.createTable();
        }
      });
    }
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Error creating drivers table:', err);
          reject(err);
        } else {
          console.log('Drivers table ready');
          resolve();
        }
      });
    });
  }

  async create(driver) {
    console.log('Creating driver:', driver);
    const sql = `
      INSERT INTO drivers (name, cpf, photo)
      VALUES (?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [driver.name, driver.cpf, driver.photo],
        function(err) {
          if (err) {
            console.error('Error creating driver:', err);
            reject(err);
          } else {
            console.log('Driver created with ID:', this.lastID);
            resolve({ ...driver, id: this.lastID });
          }
        }
      );
    });
  }

  async update(id, driver) {
    const sql = `
      UPDATE drivers
      SET name = ?, cpf = ?, photo = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [driver.name, driver.cpf, driver.photo, id],
        (err) => {
          if (err) reject(err);
          else resolve({ ...driver, id });
        }
      );
    });
  }

  async delete(id) {
    const sql = 'DELETE FROM drivers WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async findById(id) {
    const sql = 'SELECT * FROM drivers WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? new Driver(row) : null);
      });
    });
  }

  async findAll(filters = {}) {
    let sql = 'SELECT * FROM drivers WHERE 1=1';
    const params = [];

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.cpf) {
      sql += ' AND cpf LIKE ?';
      params.push(`%${filters.cpf}%`);
    }

    sql += ' ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => new Driver(row)));
      });
    });
  }
}

module.exports = DriverRepository; 