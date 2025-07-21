const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateDollySupport() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Iniciando migração para suporte ao dolly...');

      // 1. Criar nova tabela trucks com suporte ao dolly
      db.run(`
        CREATE TABLE trucks_new_dolly (
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
      `, (err) => {
        if (err && !err.message.includes('table trucks_new_dolly already exists')) {
          console.error('Erro ao criar tabela trucks_new_dolly:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela trucks_new_dolly criada/verificada');
      });

      // 2. Migrar dados existentes
      db.run(`
        INSERT OR IGNORE INTO trucks_new_dolly 
        SELECT id, plate, chassis, model, brand, year, type, 
               CASE 
                 WHEN vehicle_category IS NULL THEN 'cavalo'
                 ELSE vehicle_category 
               END as vehicle_category,
               capacity, photo, created_at
        FROM trucks
      `, (err) => {
        if (err) {
          console.error('Erro ao migrar dados dos trucks:', err);
          reject(err);
          return;
        }
        console.log('✅ Dados dos trucks migrados');
      });

      // 3. Fazer backup da tabela original e substituir
      db.run(`DROP TABLE IF EXISTS trucks_backup`, (err) => {
        if (err) {
          console.error('Erro ao remover backup anterior:', err);
          reject(err);
          return;
        }

        db.run(`ALTER TABLE trucks RENAME TO trucks_backup`, (err) => {
          if (err) {
            console.error('Erro ao criar backup da tabela trucks:', err);
            reject(err);
            return;
          }

          db.run(`ALTER TABLE trucks_new_dolly RENAME TO trucks`, (err) => {
            if (err) {
              console.error('Erro ao renomear tabela trucks_new_dolly:', err);
              reject(err);
              return;
            }
            console.log('✅ Tabela trucks atualizada com suporte ao dolly');
          });
        });
      });

      // 4. Adicionar coluna dolly_id à tabela vehicle_sets
      db.run(`
        ALTER TABLE vehicle_sets 
        ADD COLUMN dolly_id INTEGER REFERENCES trucks(id)
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar coluna dolly_id:', err);
          reject(err);
          return;
        }
        console.log('✅ Coluna dolly_id adicionada à tabela vehicle_sets');
      });

      // 5. Criar nova tabela vehicle_sets com suporte ao bitrem
      db.run(`
        CREATE TABLE vehicle_sets_new_dolly (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('cavalo', 'carreta', 'conjugado', 'bitrem')),
          cavalo_id INTEGER,
          carreta_id INTEGER,
          dolly_id INTEGER,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cavalo_id) REFERENCES trucks (id),
          FOREIGN KEY (carreta_id) REFERENCES trucks (id),
          FOREIGN KEY (dolly_id) REFERENCES trucks (id)
        )
      `, (err) => {
        if (err && !err.message.includes('table vehicle_sets_new_dolly already exists')) {
          console.error('Erro ao criar tabela vehicle_sets_new_dolly:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela vehicle_sets_new_dolly criada/verificada');
      });

      // 6. Migrar dados dos vehicle_sets
      db.run(`
        INSERT OR IGNORE INTO vehicle_sets_new_dolly 
        SELECT id, name, type, cavalo_id, carreta_id, dolly_id, description, created_at
        FROM vehicle_sets
      `, (err) => {
        if (err) {
          console.error('Erro ao migrar dados dos vehicle_sets:', err);
          reject(err);
          return;
        }
        console.log('✅ Dados dos vehicle_sets migrados');
      });

      // 7. Substituir tabela vehicle_sets
      db.run(`DROP TABLE IF EXISTS vehicle_sets_backup`, (err) => {
        if (err) {
          console.error('Erro ao remover backup anterior de vehicle_sets:', err);
          reject(err);
          return;
        }

        db.run(`ALTER TABLE vehicle_sets RENAME TO vehicle_sets_backup`, (err) => {
          if (err) {
            console.error('Erro ao criar backup da tabela vehicle_sets:', err);
            reject(err);
            return;
          }

          db.run(`ALTER TABLE vehicle_sets_new_dolly RENAME TO vehicle_sets`, (err) => {
            if (err) {
              console.error('Erro ao renomear tabela vehicle_sets_new_dolly:', err);
              reject(err);
              return;
            }
            console.log('✅ Tabela vehicle_sets atualizada com suporte ao dolly e bitrem');

            // 8. Limpar tabelas temporárias
            db.run(`DROP TABLE IF EXISTS trucks_backup`, () => {
              db.run(`DROP TABLE IF EXISTS vehicle_sets_backup`, () => {
                console.log('🎉 Migração para suporte ao dolly concluída com sucesso!');
                console.log('\nNovas funcionalidades disponíveis:');
                console.log('- Cadastro de veículos tipo "dolly"');
                console.log('- Criação de conjuntos tipo "bitrem" (cavalo + carreta + dolly)');
                
                db.close((err) => {
                  if (err) {
                    console.error('Erro ao fechar conexão:', err);
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

// Executar migração se o arquivo for chamado diretamente
if (require.main === module) {
  migrateDollySupport()
    .then(() => {
      console.log('✅ Migração executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = migrateDollySupport; 