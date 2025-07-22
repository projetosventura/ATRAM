const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Iniciando migração do banco de dados...');

      // 1. Criar nova tabela drivers sem CNH, apenas com CPF
      db.run(`
        CREATE TABLE drivers_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          cpf TEXT NOT NULL,
          photo TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('table drivers_new already exists')) {
          console.error('Erro ao criar tabela drivers_new:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela drivers_new criada');
      });

      // 2. Migrar dados existentes dos drivers (sem CNH)
      db.run(`
        INSERT OR IGNORE INTO drivers_new (id, name, cpf, photo, created_at)
        SELECT id, name, 
               CASE 
                 WHEN cpf IS NOT NULL AND cpf != '' THEN cpf
                 ELSE '00000000000'
               END as cpf, 
               photo, created_at
        FROM drivers
      `, (err) => {
        if (err) {
          console.error('Erro ao migrar dados dos drivers:', err);
          reject(err);
          return;
        }
        console.log('✅ Dados dos drivers migrados (CNH removida)');
      });

      // 3. Criar nova tabela trucks sem capacity
      db.run(`
        CREATE TABLE trucks_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plate TEXT NOT NULL UNIQUE,
          chassis TEXT NOT NULL UNIQUE,
          model TEXT NOT NULL,
          brand TEXT NOT NULL,
          year INTEGER NOT NULL,
          type TEXT NOT NULL,
          vehicle_category TEXT NOT NULL CHECK(vehicle_category IN ('cavalo', 'carreta', 'dolly')),
          photo TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('table trucks_new already exists')) {
          console.error('Erro ao criar tabela trucks_new:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela trucks_new criada');
      });

      // 4. Migrar dados existentes dos trucks (sem capacity)
      db.run(`
        INSERT OR IGNORE INTO trucks_new (id, plate, chassis, model, brand, year, type, vehicle_category, photo, created_at)
        SELECT id, plate, chassis, model, brand, year, type, 
               CASE 
                 WHEN vehicle_category IS NULL THEN 'cavalo'
                 ELSE vehicle_category 
               END as vehicle_category,
               photo, created_at
        FROM trucks
      `, (err) => {
        if (err) {
          console.error('Erro ao migrar dados dos trucks:', err);
          reject(err);
          return;
        }
        console.log('✅ Dados dos trucks migrados');
      });

      // 5. Renomear tabelas antigas e substituir pelas novas
      db.run(`DROP TABLE IF EXISTS drivers_old`, (err) => {
        if (err) {
          console.error('Erro ao dropar drivers_old:', err);
        }
      });

      db.run(`DROP TABLE IF EXISTS trucks_old`, (err) => {
        if (err) {
          console.error('Erro ao dropar trucks_old:', err);
        }
      });

      db.run(`ALTER TABLE drivers RENAME TO drivers_old`, (err) => {
        if (err && !err.message.includes('no such table')) {
          console.error('Erro ao renomear tabela drivers:', err);
        }
      });

      db.run(`ALTER TABLE trucks RENAME TO trucks_old`, (err) => {
        if (err && !err.message.includes('no such table')) {
          console.error('Erro ao renomear tabela trucks:', err);
        }
      });

      db.run(`ALTER TABLE drivers_new RENAME TO drivers`, (err) => {
        if (err) {
          console.error('Erro ao renomear drivers_new para drivers:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela drivers atualizada');
      });

      db.run(`ALTER TABLE trucks_new RENAME TO trucks`, (err) => {
        if (err) {
          console.error('Erro ao renomear trucks_new para trucks:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela trucks atualizada');
        console.log('🎉 Migração concluída com sucesso!');
        resolve();
      });
    });
  });
}

if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('Migração executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = migrateDatabase; 