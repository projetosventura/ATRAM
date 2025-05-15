const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class InspectionRequestRepository {
  constructor() {
    this.db = global.db;
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS inspection_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        truck_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending',
        inspection_date DATETIME,
        mileage INTEGER,
        fuel_level INTEGER,
        tire_condition TEXT,
        brake_condition TEXT,
        oil_level TEXT,
        general_condition TEXT,
        observations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (truck_id) REFERENCES trucks (id),
        FOREIGN KEY (driver_id) REFERENCES drivers (id)
      )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Error creating inspection_requests table:', err);
          reject(err);
        } else {
          console.log('Inspection requests table ready');
          resolve();
        }
      });
    });
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async create(inspectionRequest) {
    const token = this.generateToken();
    const sql = `
      INSERT INTO inspection_requests (
        truck_id, driver_id, token, status,
        inspection_date, mileage, fuel_level,
        tire_condition, brake_condition, oil_level,
        general_condition, observations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [
          inspectionRequest.truck_id,
          inspectionRequest.driver_id,
          token,
          inspectionRequest.status,
          inspectionRequest.inspection_date,
          inspectionRequest.mileage,
          inspectionRequest.fuel_level,
          inspectionRequest.tire_condition,
          inspectionRequest.brake_condition,
          inspectionRequest.oil_level,
          inspectionRequest.general_condition,
          inspectionRequest.observations
        ],
        function(err) {
          if (err) {
            console.error('Error creating inspection request:', err);
            reject(err);
          } else {
            resolve({ ...inspectionRequest, id: this.lastID, token });
          }
        }
      );
    });
  }

  async findById(id) {
    const sql = `
      SELECT ir.*, 
             t.plate as truck_plate, t.model as truck_model,
             d.name as driver_name
      FROM inspection_requests ir
      JOIN trucks t ON ir.truck_id = t.id
      JOIN drivers d ON ir.driver_id = d.id
      WHERE ir.id = ?
    `;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async findByToken(token) {
    const sql = `
      SELECT ir.*, 
             t.plate as truck_plate, t.model as truck_model,
             d.name as driver_name
      FROM inspection_requests ir
      JOIN trucks t ON ir.truck_id = t.id
      JOIN drivers d ON ir.driver_id = d.id
      WHERE ir.token = ?
    `;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [token], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async update(id, inspectionRequest) {
    const sql = `
      UPDATE inspection_requests
      SET inspection_date = ?,
          mileage = ?,
          fuel_level = ?,
          tire_condition = ?,
          brake_condition = ?,
          oil_level = ?,
          general_condition = ?,
          observations = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [
          inspectionRequest.inspection_date,
          inspectionRequest.mileage,
          inspectionRequest.fuel_level,
          inspectionRequest.tire_condition,
          inspectionRequest.brake_condition,
          inspectionRequest.oil_level,
          inspectionRequest.general_condition,
          inspectionRequest.observations,
          inspectionRequest.status,
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ ...inspectionRequest, id });
        }
      );
    });
  }

  async findAll(filters = {}) {
    let sql = `
      SELECT ir.*, 
             t.plate as truck_plate, t.model as truck_model,
             d.name as driver_name
      FROM inspection_requests ir
      JOIN trucks t ON ir.truck_id = t.id
      JOIN drivers d ON ir.driver_id = d.id
      WHERE ir.inspection_date IS NOT NULL
    `;

    const params = [];
    
    if (filters.status) {
      sql += ' AND ir.status = ?';
      params.push(filters.status);
    }
    
    if (filters.truck_id) {
      sql += ' AND ir.truck_id = ?';
      params.push(filters.truck_id);
    }
    
    if (filters.driver_id) {
      sql += ' AND ir.driver_id = ?';
      params.push(filters.driver_id);
    }

    if (filters.truck_plate) {
      sql += ' AND t.plate LIKE ?';
      params.push(`%${filters.truck_plate}%`);
    }

    if (filters.driver_name) {
      sql += ' AND d.name LIKE ?';
      params.push(`%${filters.driver_name}%`);
    }

    sql += ' ORDER BY ir.created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async savePhotos(inspectionId, photos, truckPlate) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'inspections', truckPlate);
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      
      const photoPromises = photos.map(async (photo, index) => {
        const filename = `${Date.now()}-${index}${path.extname(photo.originalname)}`;
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, photo.buffer);
        
        // Salvar no banco de dados
        const sql = `
          INSERT INTO inspection_photos (inspection_id, photo_path)
          VALUES (?, ?)
        `;
        
        const photoPath = `/api/uploads/inspections/${truckPlate}/${filename}`;
        
        await new Promise((resolve, reject) => {
          this.db.run(sql, [inspectionId, photoPath], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        return photoPath;
      });

      return await Promise.all(photoPromises);
    } catch (error) {
      console.error('Error saving photos:', error);
      throw error;
    }
  }

  async getPhotos(inspectionId) {
    const sql = `
      SELECT photo_path
      FROM inspection_photos
      WHERE inspection_id = ?
      ORDER BY created_at ASC
    `;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [inspectionId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows ? rows.map(row => row.photo_path) : []);
      });
    });
  }
}

module.exports = InspectionRequestRepository; 