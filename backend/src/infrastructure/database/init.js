const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

async function initializeDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  const dbDir = path.dirname(dbPath);

  // Garantir que o diretório do banco existe
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Criar conexão com o banco
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco:', err);
      process.exit(1);
    }
    console.log('Conectado ao banco SQLite em:', dbPath);
  });

  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Garantir que o diretório de uploads existe
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Criar tabelas
  await createTables(db);

  return db;
}

const createTables = async (db) => {
  // Helper para executar queries
  const runQuery = (sql) => {
    return new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('Erro ao executar query:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  try {
    // Tabela de motoristas
    await runQuery(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cnh TEXT NOT NULL UNIQUE,
        cnh_expiration_date DATE NOT NULL,
        vehicle_type TEXT NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de caminhões
    await runQuery(`
      CREATE TABLE IF NOT EXISTS trucks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plate TEXT NOT NULL UNIQUE,
        chassis TEXT NOT NULL UNIQUE,
        model TEXT NOT NULL,
        brand TEXT NOT NULL,
        year INTEGER NOT NULL,
        type TEXT NOT NULL,
        capacity REAL NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de solicitações de vistoria
    await runQuery(`
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
    `);

    // Tabela de fotos das vistorias
    await runQuery(`
      CREATE TABLE IF NOT EXISTS inspection_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspection_id INTEGER NOT NULL,
        photo_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inspection_id) REFERENCES inspection_requests (id) ON DELETE CASCADE
      )
    `);

    console.log('Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    process.exit(1);
  }
};

module.exports = initializeDatabase; 