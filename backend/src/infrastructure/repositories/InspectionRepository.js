const Inspection = require('../../domain/entities/Inspection');

class InspectionRepository {
  constructor(db) {
    this.db = db;
  }

  async create(inspection) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Inserir a inspeção
        this.db.run(
          `INSERT INTO inspections (
            truck_id, driver_id, inspection_date, mileage, fuel_level,
            brake_condition, general_condition,
            observations, next_inspection_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            inspection.truck_id,
            inspection.driver_id,
            inspection.inspection_date,
            inspection.mileage,
            inspection.fuel_level,
            inspection.brake_condition,
            inspection.general_condition,
            inspection.observations,
            inspection.next_inspection_date,
            inspection.status
          ],
          function(err) {
            if (err) {
              this.db.run('ROLLBACK');
              return reject(err);
            }

            const inspectionId = this.lastID;

            // Inserir as fotos
            const photoPromises = inspection.photos.map(photo => {
              return new Promise((resolve, reject) => {
                this.db.run(
                  'INSERT INTO inspection_photos (inspection_id, photo_path, description) VALUES (?, ?, ?)',
                  [inspectionId, photo.path, photo.description],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(photoPromises)
              .then(() => {
                this.db.run('COMMIT');
                resolve({ ...inspection, id: inspectionId });
              })
              .catch(err => {
                this.db.run('ROLLBACK');
                reject(err);
              });
          }.bind(this)
        );
      });
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Buscar inspeção
        this.db.get(
          'SELECT * FROM inspections WHERE id = ?',
          [id],
          (err, inspection) => {
            if (err) return reject(err);
            if (!inspection) return resolve(null);

            // Buscar fotos da inspeção
            this.db.all(
              'SELECT * FROM inspection_photos WHERE inspection_id = ?',
              [id],
              (err, photos) => {
                if (err) return reject(err);

                const fullInspection = new Inspection({
                  ...inspection,
                  photos: photos || []
                });

                resolve(fullInspection);
              }
            );
          }
        );
      });
    });
  }

  async findAll(filters = {}) {
    let sql = `
      SELECT i.*, 
             d.name as driver_name,
             t.plate as truck_plate,
             t.model as truck_model
      FROM inspections i
      LEFT JOIN drivers d ON i.driver_id = d.id
      LEFT JOIN trucks t ON i.truck_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.truck_id) {
      sql += ' AND i.truck_id = ?';
      params.push(filters.truck_id);
    }

    if (filters.driver_id) {
      sql += ' AND i.driver_id = ?';
      params.push(filters.driver_id);
    }

    if (filters.status) {
      sql += ' AND i.status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      sql += ' AND i.inspection_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += ' AND i.inspection_date <= ?';
      params.push(filters.end_date);
    }

    sql += ' ORDER BY i.inspection_date DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, async (err, rows) => {
        if (err) return reject(err);

        // Buscar fotos para cada inspeção
        const inspectionsWithPhotos = await Promise.all(
          rows.map(async (row) => {
            const photos = await new Promise((resolve, reject) => {
              this.db.all(
                'SELECT * FROM inspection_photos WHERE inspection_id = ?',
                [row.id],
                (err, photos) => {
                  if (err) reject(err);
                  else resolve(photos || []);
                }
              );
            });

            return new Inspection({ ...row, photos });
          })
        );

        resolve(inspectionsWithPhotos);
      });
    });
  }

  async update(id, inspection) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Atualizar inspeção
        this.db.run(
          `UPDATE inspections SET
            truck_id = ?, driver_id = ?, inspection_date = ?, mileage = ?,
            fuel_level = ?, brake_condition = ?, general_condition = ?,
            observations = ?, next_inspection_date = ?, status = ?
          WHERE id = ?`,
          [
            inspection.truck_id,
            inspection.driver_id,
            inspection.inspection_date,
            inspection.mileage,
            inspection.fuel_level,
            inspection.brake_condition,
            inspection.general_condition,
            inspection.observations,
            inspection.next_inspection_date,
            inspection.status,
            id
          ],
          (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              return reject(err);
            }

            // Remover fotos antigas
            this.db.run(
              'DELETE FROM inspection_photos WHERE inspection_id = ?',
              [id],
              async (err) => {
                if (err) {
                  this.db.run('ROLLBACK');
                  return reject(err);
                }

                // Inserir novas fotos
                try {
                  const photoPromises = inspection.photos.map(photo => {
                    return new Promise((resolve, reject) => {
                      this.db.run(
                        'INSERT INTO inspection_photos (inspection_id, photo_path, description) VALUES (?, ?, ?)',
                        [id, photo.path, photo.description],
                        (err) => {
                          if (err) reject(err);
                          else resolve();
                        }
                      );
                    });
                  });

                  await Promise.all(photoPromises);
                  this.db.run('COMMIT');
                  resolve({ ...inspection, id });
                } catch (err) {
                  this.db.run('ROLLBACK');
                  reject(err);
                }
              }
            );
          }
        );
      });
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Remover fotos
        this.db.run(
          'DELETE FROM inspection_photos WHERE inspection_id = ?',
          [id],
          (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              return reject(err);
            }

            // Remover inspeção
            this.db.run(
              'DELETE FROM inspections WHERE id = ?',
              [id],
              (err) => {
                if (err) {
                  this.db.run('ROLLBACK');
                  return reject(err);
                }

                this.db.run('COMMIT');
                resolve();
              }
            );
          }
        );
      });
    });
  }
}

module.exports = InspectionRepository; 