const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixForeignKeys() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Iniciando correção das foreign keys...');

      // 1. Criar nova tabela inspection_requests com as constraints corretas
      db.run(`
        CREATE TABLE inspection_requests_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vehicle_set_id INTEGER,
          truck_id INTEGER,
          driver_id INTEGER NOT NULL,
          token TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'pending',
          inspection_date DATETIME,
          mileage INTEGER,
          fuel_level INTEGER,
          brake_condition TEXT,
          general_condition TEXT,
          observations TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vehicle_set_id) REFERENCES vehicle_sets (id),
          FOREIGN KEY (truck_id) REFERENCES trucks (id),
          FOREIGN KEY (driver_id) REFERENCES drivers (id)
        )
      `, (err) => {
        if (err && !err.message.includes('table inspection_requests_new already exists')) {
          console.error('Erro ao criar tabela inspection_requests_new:', err);
          reject(err);
          return;
        }
        console.log('✅ Nova tabela inspection_requests criada');

        // 2. Copiar dados da tabela antiga para a nova (somente os que têm truck_id válido)
        db.run(`
          INSERT OR IGNORE INTO inspection_requests_new 
          (id, truck_id, driver_id, token, status, inspection_date, mileage, fuel_level, brake_condition, general_condition, observations, created_at, updated_at)
          SELECT ir.id, ir.truck_id, ir.driver_id, ir.token, ir.status, ir.inspection_date, ir.mileage, ir.fuel_level, ir.brake_condition, ir.general_condition, ir.observations, ir.created_at, ir.updated_at
          FROM inspection_requests ir
          WHERE ir.truck_id IN (SELECT id FROM trucks)
          AND ir.driver_id IN (SELECT id FROM drivers)
        `, (err) => {
          if (err) {
            console.error('Erro ao copiar dados:', err);
            reject(err);
            return;
          }
          console.log('✅ Dados copiados com sucesso');

          // 3. Fazer backup da tabela antiga e renomear a nova
          db.run(`DROP TABLE IF EXISTS inspection_requests_backup`, (err) => {
            if (err) {
              console.error('Erro ao remover backup antigo:', err);
              reject(err);
              return;
            }

            db.run(`ALTER TABLE inspection_requests RENAME TO inspection_requests_backup`, (err) => {
              if (err) {
                console.error('Erro ao fazer backup:', err);
                reject(err);
                return;
              }

              db.run(`ALTER TABLE inspection_requests_new RENAME TO inspection_requests`, (err) => {
                if (err) {
                  console.error('Erro ao renomear tabela:', err);
                  reject(err);
                  return;
                }

                console.log('✅ Tabela inspection_requests atualizada com sucesso');
                console.log('🎉 Correção das foreign keys concluída!');
                
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

// Executar correção se chamado diretamente
if (require.main === module) {
  fixForeignKeys()
    .then(() => {
      console.log('Correção executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na correção:', error);
      process.exit(1);
    });
}

module.exports = fixForeignKeys; 