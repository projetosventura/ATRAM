const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateVehicleCategories() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Iniciando migração para categorias de veículos...');

      // 1. Adicionar coluna vehicle_category à tabela trucks (se não existir)
      db.run(`
        ALTER TABLE trucks 
        ADD COLUMN vehicle_category TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna vehicle_category:', err);
          reject(err);
          return;
        }
        console.log('✅ Coluna vehicle_category adicionada/verificada');
      });

      // 2. Criar tabela vehicle_sets (se não existir)
      db.run(`
        CREATE TABLE IF NOT EXISTS vehicle_sets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('cavalo', 'carreta', 'conjugado')),
          cavalo_id INTEGER,
          carreta_id INTEGER,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cavalo_id) REFERENCES trucks (id),
          FOREIGN KEY (carreta_id) REFERENCES trucks (id)
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela vehicle_sets:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela vehicle_sets criada/verificada');
      });

      // 3. Adicionar coluna vehicle_set_id à tabela inspection_requests (se não existir)
      db.run(`
        ALTER TABLE inspection_requests 
        ADD COLUMN vehicle_set_id INTEGER
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna vehicle_set_id:', err);
          reject(err);
          return;
        }
        console.log('✅ Coluna vehicle_set_id adicionada/verificada');
      });

      // 4. Atualizar veículos existentes com categorias padrão baseadas no tipo
      db.run(`
        UPDATE trucks 
        SET vehicle_category = CASE 
          WHEN type LIKE '%Carreta%' OR type LIKE '%carreta%' THEN 'carreta'
          WHEN type LIKE '%Bitrem%' OR type LIKE '%bitrem%' THEN 'carreta'
          ELSE 'cavalo'
        END
        WHERE vehicle_category IS NULL
      `, (err) => {
        if (err) {
          console.error('Erro ao atualizar categorias dos veículos:', err);
          reject(err);
          return;
        }
        console.log('✅ Categorias de veículos existentes atualizadas');
      });

      // 5. Adicionar constraint NOT NULL para vehicle_category (criar nova tabela e migrar dados)
      db.run(`
        CREATE TABLE trucks_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plate TEXT NOT NULL UNIQUE,
          chassis TEXT NOT NULL UNIQUE,
          model TEXT NOT NULL,
          brand TEXT NOT NULL,
          year INTEGER NOT NULL,
          type TEXT NOT NULL,
          vehicle_category TEXT NOT NULL CHECK(vehicle_category IN ('cavalo', 'carreta')),
          capacity REAL NOT NULL,
          photo TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('table trucks_new already exists')) {
          console.error('Erro ao criar tabela trucks_new:', err);
          reject(err);
          return;
        }

        // Copiar dados da tabela antiga para a nova
        db.run(`
          INSERT OR IGNORE INTO trucks_new 
          SELECT id, plate, chassis, model, brand, year, type, vehicle_category, capacity, photo, created_at 
          FROM trucks 
          WHERE vehicle_category IS NOT NULL
        `, (err) => {
          if (err) {
            console.error('Erro ao copiar dados para trucks_new:', err);
            reject(err);
            return;
          }

          // Fazer backup da tabela antiga e renomear a nova
          db.run(`DROP TABLE IF EXISTS trucks_old`, (err) => {
            if (err) {
              console.error('Erro ao remover backup antigo:', err);
              reject(err);
              return;
            }

            db.run(`ALTER TABLE trucks RENAME TO trucks_old`, (err) => {
              if (err) {
                console.error('Erro ao fazer backup da tabela trucks:', err);
                reject(err);
                return;
              }

              db.run(`ALTER TABLE trucks_new RENAME TO trucks`, (err) => {
                if (err) {
                  console.error('Erro ao renomear trucks_new:', err);
                  reject(err);
                  return;
                }

                console.log('✅ Estrutura da tabela trucks atualizada com sucesso');
                console.log('🎉 Migração concluída com sucesso!');
                
                db.close((err) => {
                  if (err) {
                    console.error('Erro ao fechar banco de dados:', err);
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateVehicleCategories()
    .then(() => {
      console.log('Migração executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = migrateVehicleCategories; 