const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Truck = require('../../domain/entities/Truck');

class TruckRepository {
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
      CREATE TABLE IF NOT EXISTS trucks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plate TEXT NOT NULL UNIQUE,
        chassis TEXT NOT NULL UNIQUE,
        model TEXT NOT NULL,
        brand TEXT NOT NULL,
        year INTEGER NOT NULL,
        type TEXT NOT NULL,
        vehicle_category TEXT NOT NULL CHECK(vehicle_category IN ('cavalo', 'carreta', 'dolly')),
        capacity REAL NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Error creating trucks table:', err);
          reject(err);
        } else {
          console.log('Trucks table ready');
          resolve();
        }
      });
    });
  }

  async create(truck) {
    console.log('Creating truck:', truck);
    const sql = `
      INSERT INTO trucks (plate, chassis, model, brand, year, type, vehicle_category, capacity, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [truck.plate, truck.chassis, truck.model, truck.brand, truck.year, truck.type, truck.vehicle_category, truck.capacity, truck.photo],
        function(err) {
          if (err) {
            console.error('Error creating truck:', err);
            reject(err);
          } else {
            console.log('Truck created with ID:', this.lastID);
            resolve({ ...truck, id: this.lastID });
          }
        }
      );
    });
  }

  async update(id, truck) {
    const sql = `
      UPDATE trucks
      SET plate = ?, chassis = ?, model = ?, brand = ?, year = ?, type = ?, vehicle_category = ?, capacity = ?, photo = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [truck.plate, truck.chassis, truck.model, truck.brand, truck.year, truck.type, truck.vehicle_category, truck.capacity, truck.photo, id],
        (err) => {
          if (err) reject(err);
          else resolve({ ...truck, id });
        }
      );
    });
  }

  async delete(id) {
    const sql = 'DELETE FROM trucks WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async findById(id) {
    const sql = 'SELECT * FROM trucks WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? new Truck(row) : null);
      });
    });
  }

  async findByPlate(plate) {
    const sql = 'SELECT * FROM trucks WHERE plate = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [plate], (err, row) => {
        if (err) reject(err);
        else resolve(row ? new Truck(row) : null);
      });
    });
  }

  async findByChassis(chassis) {
    const sql = 'SELECT * FROM trucks WHERE chassis = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [chassis], (err, row) => {
        if (err) reject(err);
        else resolve(row ? new Truck(row) : null);
      });
    });
  }

  async findAll(filters = {}) {
    let sql = 'SELECT * FROM trucks WHERE 1=1';
    const params = [];

    if (filters.plate) {
      sql += ' AND plate LIKE ?';
      params.push(`%${filters.plate}%`);
    }

    if (filters.model) {
      sql += ' AND model LIKE ?';
      params.push(`%${filters.model}%`);
    }

    if (filters.brand) {
      sql += ' AND brand LIKE ?';
      params.push(`%${filters.brand}%`);
    }

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.vehicle_category) {
      sql += ' AND vehicle_category = ?';
      params.push(filters.vehicle_category);
    }

    if (filters.year) {
      sql += ' AND year = ?';
      params.push(filters.year);
    }

    sql += ' ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => new Truck(row)));
      });
    });
  }
}

module.exports = TruckRepository; 