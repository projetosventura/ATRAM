const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const VehicleSet = require('../../domain/entities/VehicleSet');

class VehicleSetRepository {
  constructor() {
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

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS vehicle_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('cavalo', 'carreta', 'conjugado', 'bitrem', 'dolly_semi_reboque')),
        cavalo_id INTEGER,
        carreta_id INTEGER,
        dolly_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cavalo_id) REFERENCES trucks (id),
        FOREIGN KEY (carreta_id) REFERENCES trucks (id),
        FOREIGN KEY (dolly_id) REFERENCES trucks (id)
      )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Error creating vehicle_sets table:', err);
          reject(err);
        } else {
          console.log('VehicleSets table ready');
          resolve();
        }
      });
    });
  }

  async create(vehicleSet) {
    console.log('Creating vehicle set:', vehicleSet);
    const sql = `
      INSERT INTO vehicle_sets (name, type, cavalo_id, carreta_id, dolly_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [vehicleSet.name, vehicleSet.type, vehicleSet.cavalo_id, vehicleSet.carreta_id, vehicleSet.dolly_id, vehicleSet.description],
        function(err) {
          if (err) {
            console.error('Error creating vehicle set:', err);
            reject(err);
          } else {
            console.log('Vehicle set created with ID:', this.lastID);
            resolve({ ...vehicleSet, id: this.lastID });
          }
        }
      );
    });
  }

  async update(id, vehicleSet) {
    const sql = `
      UPDATE vehicle_sets
      SET name = ?, type = ?, cavalo_id = ?, carreta_id = ?, dolly_id = ?, description = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [vehicleSet.name, vehicleSet.type, vehicleSet.cavalo_id, vehicleSet.carreta_id, vehicleSet.dolly_id, vehicleSet.description, id],
        (err) => {
          if (err) reject(err);
          else resolve({ ...vehicleSet, id });
        }
      );
    });
  }

  async delete(id) {
    const sql = 'DELETE FROM vehicle_sets WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async findById(id) {
    const sql = 'SELECT * FROM vehicle_sets WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? new VehicleSet(row) : null);
      });
    });
  }

  async findAll(filters = {}) {
    let sql = 'SELECT * FROM vehicle_sets WHERE 1=1';
    const params = [];

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    sql += ' ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => new VehicleSet(row)));
      });
    });
  }

  // Método para buscar conjuntos com informações detalhadas dos veículos
  async findAllWithVehicles(filters = {}) {
    let sql = `
      SELECT 
        vs.*,
        c.plate as cavalo_plate, c.model as cavalo_model, c.brand as cavalo_brand,
        cr.plate as carreta_plate, cr.model as carreta_model, cr.brand as carreta_brand,
        d.plate as dolly_plate, d.model as dolly_model, d.brand as dolly_brand
      FROM vehicle_sets vs
      LEFT JOIN trucks c ON vs.cavalo_id = c.id
      LEFT JOIN trucks cr ON vs.carreta_id = cr.id
      LEFT JOIN trucks d ON vs.dolly_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      sql += ' AND vs.name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.type) {
      sql += ' AND vs.type = ?';
      params.push(filters.type);
    }

    sql += ' ORDER BY vs.created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          const vehicleSets = rows.map(row => {
            const vehicleSet = new VehicleSet({
              id: row.id,
              name: row.name,
              type: row.type,
              cavalo_id: row.cavalo_id,
              carreta_id: row.carreta_id,
              dolly_id: row.dolly_id,
              description: row.description,
              created_at: row.created_at
            });

            // Adicionar informações dos veículos
            vehicleSet.cavalo_info = row.cavalo_id ? {
              plate: row.cavalo_plate,
              model: row.cavalo_model,
              brand: row.cavalo_brand
            } : null;

            vehicleSet.carreta_info = row.carreta_id ? {
              plate: row.carreta_plate,
              model: row.carreta_model,
              brand: row.carreta_brand
            } : null;

            vehicleSet.dolly_info = row.dolly_id ? {
              plate: row.dolly_plate,
              model: row.dolly_model,
              brand: row.dolly_brand
            } : null;

            return vehicleSet;
          });
          resolve(vehicleSets);
        }
      });
    });
  }

  // Método para verificar se um veículo já está sendo usado em algum conjunto
  async isVehicleInUse(vehicleId, excludeSetId = null) {
    let sql = 'SELECT id FROM vehicle_sets WHERE (cavalo_id = ? OR carreta_id = ? OR dolly_id = ?)';
    const params = [vehicleId, vehicleId, vehicleId];
    
    if (excludeSetId) {
      sql += ' AND id != ?';
      params.push(excludeSetId);
    }

    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }
}

module.exports = VehicleSetRepository; 