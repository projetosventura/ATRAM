const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function migrateDollySemiReboque() {
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Iniciando migração para suporte ao dolly semi reboque...');

      // 1. Criar nova tabela vehicle_sets com suporte ao dolly_semi_reboque
      db.run(`
        CREATE TABLE IF NOT EXISTS vehicle_sets_new_dolly_semi_reboque (
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
      `, (err) => {
        if (err && !err.message.includes('table vehicle_sets_new_dolly_semi_reboque already exists')) {
          console.error('Erro ao criar tabela vehicle_sets_new_dolly_semi_reboque:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela vehicle_sets_new_dolly_semi_reboque criada/verificada');
      });

      // 2. Migrar dados dos vehicle_sets existentes
      db.run(`
        INSERT OR IGNORE INTO vehicle_sets_new_dolly_semi_reboque 
        SELECT * FROM vehicle_sets
      `, (err) => {
        if (err) {
          console.error('Erro ao migrar dados dos vehicle_sets:', err);
          reject(err);
          return;
        }
        console.log('✅ Dados dos vehicle_sets migrados');
      });

      // 3. Remover tabela antiga
      db.run(`DROP TABLE IF EXISTS vehicle_sets`, (err) => {
        if (err) {
          console.error('Erro ao remover tabela antiga vehicle_sets:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela antiga vehicle_sets removida');
      });

      // 4. Renomear nova tabela
      db.run(`
        ALTER TABLE vehicle_sets_new_dolly_semi_reboque 
        RENAME TO vehicle_sets
      `, (err) => {
        if (err) {
          console.error('Erro ao renomear tabela vehicle_sets_new_dolly_semi_reboque:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabela renomeada para vehicle_sets');
        
        db.close((err) => {
          if (err) {
            console.error('Erro ao fechar conexão:', err);
            reject(err);
          } else {
            console.log('✅ Migração para dolly semi reboque concluída com sucesso!');
            resolve();
          }
        });
      });
    });
  });
}

// Executar migração se o script for chamado diretamente
if (require.main === module) {
  migrateDollySemiReboque()
    .then(() => {
      console.log('Migração executada com sucesso!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro na migração:', err);
      process.exit(1);
    });
}

module.exports = migrateDollySemiReboque; 